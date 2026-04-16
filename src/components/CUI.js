import React, { useState } from "react";
import _ from "lodash";
import { Table, Button } from "react-bootstrap";
import DisabledCells from "./DisabledCells";
import DisabledCell from "./DisabledCell";
import { getItem, setItem } from "../shared/db";
import isEquationSolvable from "../shared/isEquationSolvable";
import buildEquationSides from "../shared/buildEquationSides";
import shouldCompute from "../shared/shouldCompute";
import solveEquation from "../shared/solveEquation";
import hasContent from "../shared/hasContent";
import TableInputGenerator from "./TableInputGenerator";
import CrudModals from "./CrudModals";
import genByCol from "../shared/genByCol";
import genByRow from "../shared/genByRow";

const CUI = ({ appValues }) => {
  /******************************************************************************/
  const emptyCUIByInstitutionalSectors = {
    // TODO: customize this object when copying file content to another
    scxR: {
      resource: {
        rm: null,
        total: null,
      },
    },
    idb: {
      resource: {
        society: null,
        gov: null,
        homes: null,
        st: null,
        total: null,
      },
    },
    gcf: {
      usage: {
        gov: null,
        homes: null,
        st: null,
        total: null,
      },
    },
    ab: {
      usage: {
        society: null,
        gov: null,
        homes: null,
        st: null,
        total: null,
      },
    },
    scxU: {
      usage: {
        rm: null,
        total: null,
      },
    },
  };
  const storedCUIByInstitutionalSectors = getItem("cUIByInstitutionalSectors");
  const [CUIByInstitutionalSectors, setCUIByInstitutionalSectors] = useState(
    _.cloneDeep(
      storedCUIByInstitutionalSectors || emptyCUIByInstitutionalSectors
    )
  );
  const saveCUIByInstitutionalSectorsValues = (content) => {
    setCUIByInstitutionalSectors(_.cloneDeep(content));
    setItem("cUIByInstitutionalSectors", content);
  };
  const handleCUIByInstitutionalSectorsValueChange = (value, path) => {
    _.set(CUIByInstitutionalSectors, path, value);
    saveCUIByInstitutionalSectorsValues(CUIByInstitutionalSectors);
  };
  const computeByInstitutionalSectors = () => {
    console.log(
      "Calculando valores de Cuenta de Utilización del Ingreso por Sectores Institucionales"
    );
    const idb = (row, side, col) => {
      const equation = [];

      if (col === "society") {
        equation.push(
          genByRow(row, "resource", col, "idb", side),
          "=",
          genByRow(row, "usage", col, "ab", side)
        );
      } else {
        equation.push(
          genByRow(row, "resource", col, "idb", side),
          "=",
          genByRow(row, "usage", col, "ab", side),
          "+",
          genByRow(row, "usage", col, "gcf", side)
        );
      }

      return [equation];
    };
    let hasComputed = false;
    let maxAmountOfIterations = 100;
    do {
      hasComputed = false;
      const rows = Object.keys(emptyCUIByInstitutionalSectors);
      let iRows = 0;
      while (iRows < rows.length && !hasComputed) {
        const row = rows[iRows];
        let sides;
        let cols;
        const equationsGenerators = [];
        // TODO: customize this segment when copying file content to another (build assignation of equations generators according to current row)
        if (row === "scxR" || row === "scxU") {
          sides = row === "scxR" ? ["resource"] : ["usage"];
          cols = [["rm", "total"]];
          equationsGenerators.push((row, side, col) => {
            const equations = [];
            // adding generators of equations based on row calculations
            equations.push([
              genByCol(row, side, col, "rm"),
              "=",
              genByCol(row, side, col, "total"),
            ]);
            // adding generators of equations based on column calculations
            equations.push([
              genByRow(row, "resource", col, "scxR", side),
              "=",
              genByRow(row, "usage", col, "scxU", side),
            ]);
            return equations;
          });
        } else if (row === "idb") {
          sides = ["resource"];
          cols = [["society", "gov", "homes", "st", "total"]];
          equationsGenerators.push((row, side, col) => {
            const equations = [];
            // adding generators of equations based on row calculations
            if (["society", "gov", "homes", "st"].includes(col)) {
              equations.push([
                genByCol(row, side, col, "society"),
                "+",
                genByCol(row, side, col, "gov"),
                "+",
                genByCol(row, side, col, "homes"),
                "=",
                genByCol(row, side, col, "st"),
              ]);
            }
            if (["total", "st"].includes(col)) {
              equations.push([
                genByCol(row, side, col, "st"),
                "=",
                genByCol(row, side, col, "total"),
              ]);
            }
            // adding generators of equations based on column calculations
            return equations;
          });
          equationsGenerators.push(idb);
        } else if (row === "gcf") {
          sides = ["usage"];
          cols = [["gov", "homes", "st", "total"]];
          equationsGenerators.push((row, side, col) => {
            const equations = [];
            // adding generators of equations based on row calculations
            if (["gov", "homes", "st"].includes(col)) {
              equations.push([
                genByCol(row, side, col, "gov"),
                "+",
                genByCol(row, side, col, "homes"),
                "=",
                genByCol(row, side, col, "st"),
              ]);
            }
            if (["total", "st"].includes(col)) {
              equations.push([
                genByCol(row, side, col, "st"),
                "=",
                genByCol(row, side, col, "total"),
              ]);
            }
            // adding generators of equations based on column calculations
            return equations;
          });
          equationsGenerators.push(idb);
        } else if (row === "ab") {
          sides = ["usage"];
          cols = [["society", "gov", "homes", "st", "total"]];
          equationsGenerators.push((row, side, col) => {
            const equations = [];
            // adding generators of equations based on row calculations
            if (["society", "gov", "homes", "st"].includes(col)) {
              equations.push([
                genByCol(row, side, col, "society"),
                "+",
                genByCol(row, side, col, "gov"),
                "+",
                genByCol(row, side, col, "homes"),
                "=",
                genByCol(row, side, col, "st"),
              ]);
            }
            if (["total", "st"].includes(col)) {
              equations.push([
                genByCol(row, side, col, "st"),
                "=",
                genByCol(row, side, col, "total"),
              ]);
            }
            // adding generators of equations based on column calculations
            return equations;
          });
          equationsGenerators.push(idb);
        }
        let iSides = 0;
        while (iSides < sides.length && !hasComputed) {
          const side = sides[iSides];
          let iCols = 0;
          while (iCols < cols[iSides].length && !hasComputed) {
            const col = cols[iSides][iCols];
            let iEquationsGenerators = 0;
            while (
              iEquationsGenerators < equationsGenerators.length &&
              !hasComputed
            ) {
              const equations = equationsGenerators[iEquationsGenerators](
                row,
                side,
                col
              );
              let iEquations = 0;
              while (iEquations < equations.length && !hasComputed) {
                const equation = equations[iEquations];
                if (isEquationSolvable(equation, CUIByInstitutionalSectors)) {
                  console.log(`Solving ${equation.join(" ")}`);
                  const { leftSide, rightSide } = buildEquationSides(
                    equation,
                    CUIByInstitutionalSectors
                  );
                  hasComputed = shouldCompute(
                    CUIByInstitutionalSectors,
                    solveEquation(leftSide, rightSide),
                    `${row}.${side}.${col}`
                  );
                } else {
                  console.log(`Equation ${equation.join(" ")} is not solvable`);
                }
                iEquations++;
              }
              iEquationsGenerators++;
            }
            iCols++;
          }
          iSides++;
        }
        iRows++;
      }
      maxAmountOfIterations--;
    } while (hasComputed && maxAmountOfIterations > 0);
    if (maxAmountOfIterations === 0) {
      alert(
        "Se ha alcanzado el máximo número de iteraciones para calcular la Cuenta de Utilización del Ingreso por Sectores Institucionales"
      );
    }
    saveCUIByInstitutionalSectorsValues(CUIByInstitutionalSectors);
  };
  const emptyByInstitutionalSectors = () => {
    saveCUIByInstitutionalSectorsValues(emptyCUIByInstitutionalSectors);
  };
  const retrieveFromCouForByInstitutionalSectors = () => {
    if (!appValues?.cou) {
      alert("No hay valores del COU disponibles para recuperar");
      return;
    }
    // TODO: customize this segment when copying file content to another (implement retriveing and computing values from COU)
    CUIByInstitutionalSectors.gcf.usage.gov =
      appValues.cou.totalUses.finalUse.gcfGov;
    CUIByInstitutionalSectors.gcf.usage.homes =
      appValues.cou.totalUses.finalUse.gcfHomes;
    const gfcGovHasContent = hasContent(
      CUIByInstitutionalSectors.gcf.usage.gov
    );
    const gfcHomesHasContent = hasContent(
      CUIByInstitutionalSectors.gcf.usage.homes
    );
    if (gfcGovHasContent || gfcHomesHasContent) {
      const gcfGov = gfcGovHasContent
        ? CUIByInstitutionalSectors.gcf.usage.gov
        : 0;
      const gcfHomes = gfcHomesHasContent
        ? CUIByInstitutionalSectors.gcf.usage.homes
        : 0;
      CUIByInstitutionalSectors.gcf.usage.st = gcfGov + gcfHomes;
      CUIByInstitutionalSectors.gcf.usage.total =
        CUIByInstitutionalSectors.gcf.usage.st;
    }

    saveCUIByInstitutionalSectorsValues(CUIByInstitutionalSectors);
  };
  const cellGeneratorForByInstitutionalSectors = new TableInputGenerator(
    CUIByInstitutionalSectors,
    handleCUIByInstitutionalSectorsValueChange
  );
  /******************************************************************************/
  return (
    <div>
      <h2>Por Sectores Institucionales</h2>
      <Button variant="primary" onClick={computeByInstitutionalSectors}>
        Calcular
      </Button>
      &nbsp;
      <Button variant="danger" onClick={emptyByInstitutionalSectors}>
        Vaciar
      </Button>
      &nbsp;
      <CrudModals
        currentItem={CUIByInstitutionalSectors}
        storageKey="cUIByInstitutionalSectors"
        saveModalTitle="Guardar Cuenta de Utilización del Ingreso por Sectores Institucionales"
        loadModalTitle="Cargar Cuenta de Utilización del Ingreso por Sectores Institucionales"
        deleteModalTitle="Borrar Cuenta de Utilización del Ingreso por Sectores Institucionales"
        deleteModalMessage="¿Está seguro que desea borrar la Cuenta de Utilización del Ingreso por Sectores Institucionales?"
        itemSaver={saveCUIByInstitutionalSectorsValues}
      />
      &nbsp;
      <Button
        variant="warning"
        onClick={retrieveFromCouForByInstitutionalSectors}
      >
        Obtener valores desde el COU
      </Button>
      <Table
        striped
        bordered
        hover
        className="text-center align-middle mt-3 custom-table"
      >
        <thead>
          <tr>
            <th colSpan={6}>USOS</th>
            <th rowSpan={2}>Transacciones y Otros Saldos</th>
            <th colSpan={6}>RECURSOS</th>
          </tr>
          <tr>
            <th>Total</th>
            <th>Resto del Mundo</th>
            <th>SubTotal</th>
            <th>Hogares</th>
            <th>Gobierno</th>
            <th>Sociedades</th>
            <th>Sociedades</th>
            <th>Gobierno</th>
            <th>Hogares</th>
            <th>SubTotal</th>
            <th>Resto del Mundo</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            {DisabledCells("scxR", 0, 6)}
            <td>
              <strong>Saldo corriente con el exterior</strong>
            </td>
            {DisabledCells("scxR", 7, 4)}
            {cellGeneratorForByInstitutionalSectors.generate(
              "scxR.resource.rm"
            )}
            {cellGeneratorForByInstitutionalSectors.generate(
              "scxR.resource.total"
            )}
          </tr>
          <tr>
            {DisabledCells("idb", 0, 6)}
            <td>
              <strong>Ingreso Disponible Bruto</strong>
            </td>
            {cellGeneratorForByInstitutionalSectors.generate(
              "idb.resource.society"
            )}
            {cellGeneratorForByInstitutionalSectors.generate(
              "idb.resource.gov"
            )}
            {cellGeneratorForByInstitutionalSectors.generate(
              "idb.resource.homes"
            )}
            {cellGeneratorForByInstitutionalSectors.generate("idb.resource.st")}
            <DisabledCell />
            {cellGeneratorForByInstitutionalSectors.generate(
              "idb.resource.total"
            )}
          </tr>
          <tr>
            {cellGeneratorForByInstitutionalSectors.generate("gcf.usage.total")}
            <DisabledCell />
            {cellGeneratorForByInstitutionalSectors.generate("gcf.usage.st")}
            {cellGeneratorForByInstitutionalSectors.generate("gcf.usage.homes")}
            {cellGeneratorForByInstitutionalSectors.generate("gcf.usage.gov")}
            <DisabledCell />
            <td>
              <strong>Gasto de Consumo Final</strong>
            </td>
            {DisabledCells("gcf", 7, 6)}
          </tr>
          <tr>
            {cellGeneratorForByInstitutionalSectors.generate("ab.usage.total")}
            <DisabledCell />
            {cellGeneratorForByInstitutionalSectors.generate("ab.usage.st")}
            {cellGeneratorForByInstitutionalSectors.generate("ab.usage.homes")}
            {cellGeneratorForByInstitutionalSectors.generate("ab.usage.gov")}
            {cellGeneratorForByInstitutionalSectors.generate(
              "ab.usage.society"
            )}
            <td>
              <strong>Ahorro Bruto</strong>
            </td>
            {DisabledCells("ab", 0, 6)}
          </tr>
          <tr>
            {cellGeneratorForByInstitutionalSectors.generate(
              "scxU.usage.total"
            )}
            {cellGeneratorForByInstitutionalSectors.generate("scxU.usage.rm")}
            {DisabledCells("scxU", 0, 4)}
            <td>
              <strong>Saldo corriente con el exterior</strong>
            </td>
            {DisabledCells("scxU", 0, 6)}
          </tr>
        </tbody>
      </Table>
    </div>
  );
};

export default CUI;
