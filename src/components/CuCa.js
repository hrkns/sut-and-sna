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
import TableInputGenerator from "./TableInputGenerator";
import CrudModals from "./CrudModals";
import genByCol from "../shared/genByCol";
import genByRow from "../shared/genByRow";

const CuCa = ({ appValues }) => {
  /******************************************************************************/
  const emptyCuCaByInstitutionalSectors = {
    // TODO: customize this object when copying file content to another
    scx: {
      resource: {
        rm: null,
        total: null,
      },
    },
    ab: {
      resource: {
        society: null,
        gov: null,
        homes: null,
        st: null,
        total: null,
      },
    },
    tkr: {
      resource: {
        society: null,
        gov: null,
        st: null,
        rm: null,
        total: null,
      },
    },
    tke: {
      resource: {
        society: null,
        gov: null,
        st: null,
        rm: null,
        total: null,
      },
    },
    fbkf: {
      usage: {
        total: null,
        st: null,
        gov: null,
        society: null,
      },
    },
    ve: {
      usage: {
        total: null,
        st: null,
        gov: null,
        society: null,
      },
    },
    pn: {
      usage: {
        total: null,
        rm: null,
        st: null,
        homes: null,
        gov: null,
        society: null,
      },
    },
  };
  const storedCuCaByInstitutionalSectors = getItem(
    "cuCaByInstitutionalSectors"
  );
  const [CuCaByInstitutionalSectors, setCuCaByInstitutionalSectors] = useState(
    _.cloneDeep(
      storedCuCaByInstitutionalSectors || emptyCuCaByInstitutionalSectors
    )
  );
  const saveCuCaByInstitutionalSectorsValues = (content) => {
    setCuCaByInstitutionalSectors(_.cloneDeep(content));
    setItem("cuCaByInstitutionalSectors", content);
  };
  const handleCuCaByInstitutionalSectorsValueChange = (value, path) => {
    _.set(CuCaByInstitutionalSectors, path, value);
    saveCuCaByInstitutionalSectorsValues(CuCaByInstitutionalSectors);
  };
  const computeByInstitutionalSectors = () => {
    console.log(
      "Calculando valores de Cuenta Capital por Sectores Institucionales"
    );
    const pn = (row, side, col) => {
      const equation = [];
      let appendOperator = false;

      if (col === "rm" || col === "total") {
        equation.push(genByRow(row, "resource", col, "scx", side));
        appendOperator = true;
      }

      if (col !== "rm") {
        if (appendOperator) {
          equation.push("+");
        }
        equation.push(genByRow(row, "resource", col, "ab", side));
        appendOperator = true;
      }

      if (col !== "homes") {
        if (appendOperator) {
          equation.push("+");
        }
        equation.push(genByRow(row, "resource", col, "tkr", side));
        appendOperator = true;
      }

      if (col !== "homes") {
        if (appendOperator) {
          equation.push("+");
        }
        equation.push(genByRow(row, "resource", col, "tke", side));
        appendOperator = true;
      }

      if (
        col === "total" ||
        col === "st" ||
        col === "gov" ||
        col === "society"
      ) {
        if (appendOperator) {
          equation.push("-");
        }
        equation.push(genByRow(row, "usage", col, "fbkf", side));
        equation.push("-");
        equation.push(genByRow(row, "usage", col, "ve", side));
      }

      equation.push("=");
      equation.push(genByRow(row, "usage", col, "pn", side));

      return [equation];
    };
    let hasComputed = false;
    let maxAmountOfIterations = 100;
    do {
      hasComputed = false;
      const rows = Object.keys(emptyCuCaByInstitutionalSectors);
      let iRows = 0;
      while (iRows < rows.length && !hasComputed) {
        const row = rows[iRows];
        let sides;
        let cols;
        const equationsGenerators = [];
        // TODO: customize this segment when copying file content to another (build assignation of equations generators according to current row)
        if (row === "scx") {
          sides = ["resource"];
          cols = [["rm"], ["total"]];
          equationsGenerators.push((row, side, col) => {
            const equations = [];
            equations.push([
              genByCol(row, side, col, "rm"),
              "=",
              genByCol(row, side, col, "ab"),
            ]);
            return equations;
          });
        } else if (row === "ab") {
          sides = ["resource"];
          cols = [["society", "gov", "homes", "st", "total"]];
          equationsGenerators.push((row, side, col) => {
            const equations = [];
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
            if (["st", "total"].includes(col)) {
              equations.push([
                genByCol(row, side, col, "st"),
                "=",
                genByCol(row, side, col, "total"),
              ]);
            }
            return equations;
          });
        } else if (row === "tkr" || row === "tke") {
          sides = ["resource"];
          cols = [["society", "gov", "st", "rm", "total"]];
          equationsGenerators.push((row, side, col) => {
            const equations = [];
            if (["society", "gov", "st"].includes(col)) {
              equations.push([
                genByCol(row, side, col, "society"),
                "+",
                genByCol(row, side, col, "gov"),
                "=",
                genByCol(row, side, col, "st"),
              ]);
            }
            if (["st", "rm", "total"].includes(col)) {
              equations.push([
                genByCol(row, side, col, "st"),
                "+",
                genByCol(row, side, col, "rm"),
                "=",
                genByCol(row, side, col, "total"),
              ]);
            }
            return equations;
          });
        } else if (row === "fbkf" || row === "ve") {
          sides = ["usage"];
          cols = [["total", "st", "gov", "society"]];
          equationsGenerators.push((row, side, col) => {
            const equations = [];
            if (["st", "gov", "society"].includes(col)) {
              equations.push([
                genByCol(row, side, col, "st"),
                "=",
                genByCol(row, side, col, "gov"),
                "+",
                genByCol(row, side, col, "society"),
              ]);
            }
            if (["total", "st"].includes(col)) {
              equations.push([
                genByCol(row, side, col, "total"),
                "=",
                genByCol(row, side, col, "st"),
              ]);
            }
            return equations;
          });
        } else if (row === "pn") {
          sides = ["usage"];
          cols = [["total", "rm", "st", "homes", "gov", "society"]];
          equationsGenerators.push((row, side, col) => {
            const equations = [];
            if (["st", "homes", "gov", "society"].includes(col)) {
              equations.push([
                genByCol(row, side, col, "st"),
                "=",
                genByCol(row, side, col, "homes"),
                "+",
                genByCol(row, side, col, "gov"),
                "+",
                genByCol(row, side, col, "society"),
              ]);
            }
            if (["total", "rm", "st"].includes(col)) {
              equations.push([
                genByCol(row, side, col, "total"),
                "=",
                genByCol(row, side, col, "rm"),
                "+",
                genByCol(row, side, col, "st"),
              ]);
            }
            return equations;
          });
        }
        equationsGenerators.push(pn);
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
                if (isEquationSolvable(equation, CuCaByInstitutionalSectors)) {
                  console.log(`Solving ${equation.join(" ")}`);
                  const { leftSide, rightSide } = buildEquationSides(
                    equation,
                    CuCaByInstitutionalSectors
                  );
                  hasComputed = shouldCompute(
                    CuCaByInstitutionalSectors,
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
        "Se ha alcanzado el máximo número de iteraciones para calcular la Cuenta Capital por Sectores Institucionales"
      );
    }
    saveCuCaByInstitutionalSectorsValues(CuCaByInstitutionalSectors);
  };
  const emptyByInstitutionalSectors = () => {
    saveCuCaByInstitutionalSectorsValues(emptyCuCaByInstitutionalSectors);
  };
  const retrieveFromCouForByInstitutionalSectors = () => {
    if (!appValues?.cou) {
      alert("No hay valores del COU disponibles para recuperar");
      return;
    }
    // TODO: customize this segment when copying file content to another (implement retriveing and computing values from COU)
    CuCaByInstitutionalSectors.fbkf.usage.total =
      appValues.cou.totalUses.finalUse.fbkFbkf;
    CuCaByInstitutionalSectors.fbkf.usage.st =
      appValues.cou.totalUses.finalUse.fbkFbkf;
    CuCaByInstitutionalSectors.ve.usage.total =
      appValues.cou.totalUses.finalUse.fbkVe;
    CuCaByInstitutionalSectors.ve.usage.st =
      appValues.cou.totalUses.finalUse.fbkVe;

    saveCuCaByInstitutionalSectorsValues(CuCaByInstitutionalSectors);
  };
  const cellGeneratorForByInstitutionalSectors = new TableInputGenerator(
    CuCaByInstitutionalSectors,
    handleCuCaByInstitutionalSectorsValueChange
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
        currentItem={CuCaByInstitutionalSectors}
        storageKey="cuCaByInstitutionalSectors"
        saveModalTitle="Guardar Cuenta Capital por Sectores Institucionales"
        loadModalTitle="Cargar Cuenta Capital por Sectores Institucionales"
        deleteModalTitle="Borrar Cuenta Capital por Sectores Institucionales"
        deleteModalMessage="¿Está seguro que desea borrar la Cuenta Capital por Sectores Institucionales?"
        itemSaver={saveCuCaByInstitutionalSectorsValues}
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
            {DisabledCells("scx", 0, 6)}
            <td>
              <strong>Saldo corriente con el exterior</strong>
            </td>
            {DisabledCells("scx", 7, 4)}
            {cellGeneratorForByInstitutionalSectors.generate("scx.resource.rm")}
            {cellGeneratorForByInstitutionalSectors.generate(
              "scx.resource.total"
            )}
          </tr>
          <tr>
            {DisabledCells("ab", 0, 6)}
            <td>
              <strong>Ahorro Bruto</strong>
            </td>
            {cellGeneratorForByInstitutionalSectors.generate(
              "ab.resource.society"
            )}
            {cellGeneratorForByInstitutionalSectors.generate("ab.resource.gov")}
            {cellGeneratorForByInstitutionalSectors.generate(
              "ab.resource.homes"
            )}
            {cellGeneratorForByInstitutionalSectors.generate("ab.resource.st")}
            <DisabledCell />
            {cellGeneratorForByInstitutionalSectors.generate(
              "ab.resource.total"
            )}
          </tr>
          <tr>
            {DisabledCells("tkr", 0, 6)}
            <td>
              <strong>Transferencias de capital recibidas</strong>
            </td>
            {cellGeneratorForByInstitutionalSectors.generate(
              "tkr.resource.society"
            )}
            {cellGeneratorForByInstitutionalSectors.generate(
              "tkr.resource.gov"
            )}
            {DisabledCells("tkr", 8, 1)}
            {cellGeneratorForByInstitutionalSectors.generate("tkr.resource.st")}
            {cellGeneratorForByInstitutionalSectors.generate("tkr.resource.rm")}
            {cellGeneratorForByInstitutionalSectors.generate(
              "tkr.resource.total"
            )}
          </tr>
          <tr>
            {DisabledCells("tke", 0, 6)}
            <td>
              <strong>Transferencias de capital efectuadas</strong>
            </td>
            {cellGeneratorForByInstitutionalSectors.generate(
              "tke.resource.society"
            )}
            {cellGeneratorForByInstitutionalSectors.generate(
              "tke.resource.gov"
            )}
            <DisabledCell />
            {cellGeneratorForByInstitutionalSectors.generate("tke.resource.st")}
            {cellGeneratorForByInstitutionalSectors.generate("tke.resource.rm")}
            {cellGeneratorForByInstitutionalSectors.generate(
              "tke.resource.total"
            )}
          </tr>
          <tr>
            {cellGeneratorForByInstitutionalSectors.generate(
              "fbkf.usage.total"
            )}
            <DisabledCell />
            {cellGeneratorForByInstitutionalSectors.generate("fbkf.usage.st")}
            <DisabledCell />
            {cellGeneratorForByInstitutionalSectors.generate("fbkf.usage.gov")}
            {cellGeneratorForByInstitutionalSectors.generate(
              "fbkf.usage.society"
            )}
            <td>
              <strong>Formacion bruta de capital fijo</strong>
            </td>
            {DisabledCells("fbkf", 7, 6)}
          </tr>
          <tr>
            {cellGeneratorForByInstitutionalSectors.generate("ve.usage.total")}
            <DisabledCell />
            {cellGeneratorForByInstitutionalSectors.generate("ve.usage.st")}
            <DisabledCell />
            {cellGeneratorForByInstitutionalSectors.generate("ve.usage.gov")}
            {cellGeneratorForByInstitutionalSectors.generate(
              "ve.usage.society"
            )}
            <td>
              <strong>Variación de existencias</strong>
            </td>
            {DisabledCells("ve", 7, 6)}
          </tr>
          <tr>
            {cellGeneratorForByInstitutionalSectors.generate("pn.usage.total")}
            {cellGeneratorForByInstitutionalSectors.generate("pn.usage.rm")}
            {cellGeneratorForByInstitutionalSectors.generate("pn.usage.st")}
            {cellGeneratorForByInstitutionalSectors.generate("pn.usage.homes")}
            {cellGeneratorForByInstitutionalSectors.generate("pn.usage.gov")}
            {cellGeneratorForByInstitutionalSectors.generate(
              "pn.usage.society"
            )}
            <td>
              <strong>Préstamo Neto</strong>
            </td>
            {DisabledCells("pn", 7, 6)}
          </tr>
        </tbody>
      </Table>
    </div>
  );
};

export default CuCa;
