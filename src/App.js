import _ from "lodash";
import React, { useEffect, useState } from "react";
import { Accordion, Col, Form, Row } from "react-bootstrap";
import "./App.css";
import Cou from "./components/Cou";
import Footer from "./components/Footer";
import CuPro from "./components/CuPro";
import CuGeI from "./components/CuGeI";
import CuADI from "./components/CuADI";
import CUI from "./components/CUI";
import CuCa from "./components/CuCa";
import CuFi from "./components/CuFi";
import { getItem, setItem } from "./shared/db";

const MIN_BRANCHES = 1;
const MAX_BRANCHES = 4;
const DEFAULT_BRANCHES = 3;

const isBranchKey = (key) => /^branch\d+$/.test(key);

const parseBranchIndex = (key) => Number(key.replace("branch", ""));

const createBranches = (amount = DEFAULT_BRANCHES) => {
  return _.range(1, amount + 1).map((idx) => ({
    name: `Rama ${idx}`,
  }));
};

const createBranchColumns = (branchCount, fillValue = "") => {
  const cols = {};
  for (let idx = 1; idx <= branchCount; idx++) {
    cols[`branch${idx}`] = fillValue;
  }
  return cols;
};

const createEmptyCouBranchRow = (branchCount) => {
  return {
    intermediateUse: {
      ...createBranchColumns(branchCount, ""),
      gov: "",
      st: "",
    },
    finalUse: {
      gcfHomes: "",
      gcfGov: "",
      fbkFbkf: "",
      fbkVe: "",
      exports: "",
      st: "",
    },
    total: "",
  };
};

const normalizeCouByBranchCount = (cou, branchCount) => {
  const normalized =
    cou && typeof cou === "object" && !Array.isArray(cou) ? _.cloneDeep(cou) : {};

  const emptyBranchRow = createEmptyCouBranchRow(branchCount);

  for (let idx = 1; idx <= branchCount; idx++) {
    const rowKey = `branch${idx}`;
    if (!normalized[rowKey] || typeof normalized[rowKey] !== "object") {
      normalized[rowKey] = _.cloneDeep(emptyBranchRow);
      continue;
    }
    if (
      !normalized[rowKey].intermediateUse ||
      typeof normalized[rowKey].intermediateUse !== "object"
    ) {
      normalized[rowKey].intermediateUse = _.cloneDeep(
        emptyBranchRow.intermediateUse
      );
    }
    if (
      !normalized[rowKey].finalUse ||
      typeof normalized[rowKey].finalUse !== "object"
    ) {
      normalized[rowKey].finalUse = _.cloneDeep(emptyBranchRow.finalUse);
    }
    if (!Object.prototype.hasOwnProperty.call(normalized[rowKey], "total")) {
      normalized[rowKey].total = "";
    }
  }

  Object.keys(normalized).forEach((key) => {
    if (isBranchKey(key) && parseBranchIndex(key) > branchCount) {
      delete normalized[key];
    }
  });

  Object.values(normalized).forEach((row) => {
    if (!row || typeof row !== "object") {
      return;
    }

    if (!row.intermediateUse || typeof row.intermediateUse !== "object") {
      return;
    }

    for (let idx = 1; idx <= branchCount; idx++) {
      const branchKey = `branch${idx}`;
      if (!Object.prototype.hasOwnProperty.call(row.intermediateUse, branchKey)) {
        row.intermediateUse[branchKey] = "";
      }
    }

    Object.keys(row.intermediateUse).forEach((key) => {
      if (isBranchKey(key) && parseBranchIndex(key) > branchCount) {
        delete row.intermediateUse[key];
      }
    });
  });

  return normalized;
};

const sanitizeAppValues = (storedAppValues) => {
  if (
    !storedAppValues ||
    typeof storedAppValues !== "object" ||
    Array.isArray(storedAppValues)
  ) {
    return {
      branches: createBranches(DEFAULT_BRANCHES),
    };
  }

  let branches = [];
  if (Array.isArray(storedAppValues.branches)) {
    branches = storedAppValues.branches
      .slice(0, MAX_BRANCHES)
      .map((branch, idx) => {
        if (branch && typeof branch === "object" && branch.name) {
          return {
            name: `${branch.name}`,
          };
        }
        return {
          name: `Rama ${idx + 1}`,
        };
      });
  }

  if (branches.length < MIN_BRANCHES) {
    branches = createBranches(DEFAULT_BRANCHES);
  }

  const sanitized = {
    ...storedAppValues,
    branches,
  };

  if (storedAppValues.cou !== undefined) {
    sanitized.cou = normalizeCouByBranchCount(storedAppValues.cou, branches.length);
  }

  return sanitized;
};

const App = () => {
  const storedAppValues = getItem("appValues");
  const localAppValues = sanitizeAppValues(storedAppValues);
  const [appValues, setAppValues] = useState(localAppValues);

  useEffect(() => {
    setItem("appValues", appValues);
  }, [appValues]);

  return (
    <div className="m-5">
      <hr></hr>

      <Row>
        <Col sm={2}>
          <Form>
            <Form.Group className="m-1">
              <Form.Label>
                <strong>Cantidad de ramas (minimo 1, maximo 4)</strong>
              </Form.Label>
              <Form.Control
                type="number"
                value={appValues.branches.length}
                min={1}
                max={4}
                onChange={(e) => {
                  const newBranchesAmount = parseInt(e.target.value, 10);
                  if (
                    Number.isInteger(newBranchesAmount) &&
                    newBranchesAmount >= MIN_BRANCHES &&
                    newBranchesAmount <= MAX_BRANCHES
                  ) {
                    const nextAppValues = _.cloneDeep(appValues);
                    nextAppValues.branches = createBranches(newBranchesAmount);
                    if (nextAppValues.cou !== undefined) {
                      nextAppValues.cou = normalizeCouByBranchCount(
                        nextAppValues.cou,
                        newBranchesAmount
                      );
                      setItem("cou", nextAppValues.cou);
                    }
                    setAppValues(nextAppValues);
                  }
                }}
              />
            </Form.Group>
          </Form>
        </Col>
      </Row>

      <hr></hr>

      <Accordion>
        {/* Cuenta de Producción */}
        <Accordion.Item
          eventKey="0"
          style={{
            overflowX: "auto",
          }}
        >
          <Accordion.Header>
            <h1>Cuadro de Oferta y Utilización</h1>
          </Accordion.Header>
          <Accordion.Body>
            <Cou appValues={appValues} setAppValues={setAppValues} />
          </Accordion.Body>
        </Accordion.Item>
        {/* Cuenta de Generación de Ingresos */}
        <Accordion.Item
          eventKey="1"
          style={{
            overflowX: "auto",
          }}
        >
          <Accordion.Header>
            <h1>Cuenta de Producción</h1>
          </Accordion.Header>
          <Accordion.Body>
            <CuPro appValues={appValues} setAppValues={setAppValues} />
          </Accordion.Body>
        </Accordion.Item>
        {/* Cuenta de Generación de Ingresos */}
        <Accordion.Item
          eventKey="2"
          style={{
            overflowX: "auto",
          }}
        >
          <Accordion.Header>
            <h1>Cuenta de Generación de Ingresos</h1>
          </Accordion.Header>
          <Accordion.Body>
            <CuGeI appValues={appValues} setAppValues={setAppValues} />
          </Accordion.Body>
        </Accordion.Item>
        {/* Cuenta de Asignación y Distribución del Ingreso */}
        <Accordion.Item
          eventKey="3"
          style={{
            overflowX: "auto",
          }}
        >
          <Accordion.Header>
            <h1>Cuenta de Asignación y Distribución del Ingreso</h1>
          </Accordion.Header>
          <Accordion.Body>
            <CuADI appValues={appValues} setAppValues={setAppValues} />
          </Accordion.Body>
        </Accordion.Item>
        {/* Cuenta de Utilización de Ingreso */}
        <Accordion.Item
          eventKey="4"
          style={{
            overflowX: "auto",
          }}
        >
          <Accordion.Header>
            <h1>Cuenta de Utilización del Ingreso</h1>
          </Accordion.Header>
          <Accordion.Body>
            <CUI appValues={appValues} setAppValues={setAppValues} />
          </Accordion.Body>
        </Accordion.Item>
        {/* Cuenta de Capital */}
        <Accordion.Item
          eventKey="5"
          style={{
            overflowX: "auto",
          }}
        >
          <Accordion.Header>
            <h1>Cuenta Capital</h1>
          </Accordion.Header>
          <Accordion.Body>
            <CuCa appValues={appValues} setAppValues={setAppValues} />
          </Accordion.Body>
        </Accordion.Item>
        {/* Cuenta Financiera */}
        <Accordion.Item
          eventKey="6"
          style={{
            overflowX: "auto",
          }}
        >
          <Accordion.Header>
            <h1>Cuenta Financiera</h1>
          </Accordion.Header>
          <Accordion.Body>
            <CuFi appValues={appValues} setAppValues={setAppValues} />
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>

      {/* Pie de página */}
      <Footer />
    </div>
  );
};

export default App;
