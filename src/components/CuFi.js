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

const CuFi = ({ appValues }) => {
  /******************************************************************************/
  const emptyCuFiByInstitutionalSectors = {
    pn: {
      resource: {
        society: null,
        gov: null,
        homes: null,
        st: null,
        rm: null,
        total: null,
      },
    },
    anaf: {
      usage: {
        total: null,
        rm: null,
        st: null,
        homes: null,
        gov: null,
        society: null,
      },
    },
    enpf: {
      resource: {
        society: null,
        gov: null,
        homes: null,
        st: null,
        rm: null,
        total: null,
      },
    },
    dldU: {
      usage: {
        total: null,
        st: null,
        homes: null,
        society: null,
      },
    },
    dldR: {
      resource: {
        society: null,
        st: null,
        total: null,
      },
    },
    vdaU: {
      usage: {
        total: null,
        rm: null,
        st: null,
        homes: null,
        society: null,
      },
    },
    vdaR: {
      resource: {
        gov: null,
        st: null,
        total: null,
      },
    },
    pccU: {
      usage: {
        total: null,
        rm: null,
        st: null,
        homes: null,
        gov: null,
        society: null,
      },
    },
    pccR: {
      resource: {
        gov: null,
        st: null,
        total: null,
      },
    },
    aopcU: {
      usage: {
        total: null,
        rm: null,
        st: null,
        homes: null,
        gov: null,
        society: null,
      },
    },
    aopcR: {
      resource: {
        society: null,
        st: null,
        rm: null,
        total: null,
      },
    },
  };
  const storedCuFiByInstitutionalSectors = getItem(
    "cuFiByInstitutionalSectors"
  );
  const [CuFiByInstitutionalSectors, setCuFiByInstitutionalSectors] = useState(
    _.cloneDeep(
      storedCuFiByInstitutionalSectors || emptyCuFiByInstitutionalSectors
    )
  );
  const saveCuFiByInstitutionalSectorsValues = (content) => {
    setCuFiByInstitutionalSectors(_.cloneDeep(content));
    setItem("cuFiByInstitutionalSectors", content);
  };
  const handleCuFiByInstitutionalSectorsValueChange = (value, path) => {
    _.set(CuFiByInstitutionalSectors, path, value);
    saveCuFiByInstitutionalSectorsValues(CuFiByInstitutionalSectors);
  };
  const computeByInstitutionalSectors = () => {
    console.log(
      "Calculando valores de Cuenta Financiera por Sectores Institucionales"
    );
    const anaf = (row, side, col) => {
      const equation = [];
      equation.push(genByRow(row, side, col, "anaf"));
      equation.push("=");
      let appendPlus = false;
      if (col !== "rm" && col !== "gov") {
        equation.push(genByRow(row, side, col, "dldU"));
        appendPlus = true;
      }
      if (col !== "gov") {
        if (appendPlus) {
          equation.push("+");
        }
        equation.push(genByRow(row, side, col, "vdaU"));
        appendPlus = true;
      }
      if (appendPlus) {
        equation.push("+");
      }
      equation.push(genByRow(row, side, col, "pccU"));
      equation.push("+");
      equation.push(genByRow(row, side, col, "aopcU"));
      return [equation];
    };
    const enpf = (row, side, col) => {
      if (row === "enpf" && side === "resource" && col === "homes") return [];

      const equation = [];
      equation.push(genByRow(row, side, col, "enpf"));
      equation.push("=");
      let appendPlus = false;
      if (col === "society" || col === "st" || col === "total") {
        equation.push(genByRow(row, side, col, "dldR"));
        appendPlus = true;
      }
      if (col === "gov" || col === "st" || col === "total") {
        if (appendPlus) {
          equation.push("+");
        }
        equation.push(genByRow(row, side, col, "vdaR"));
        appendPlus = true;
        equation.push("+");
        equation.push(genByRow(row, side, col, "pccR"));
      }
      if (col !== "gov" && col !== "homes") {
        if (appendPlus) {
          equation.push("+");
        }
        equation.push(genByRow(row, side, col, "aopcR"));
      }
      return [equation];
    };
    let hasComputed = false;
    let maxAmountOfIterations = 100;
    do {
      hasComputed = false;
      const rows = Object.keys(emptyCuFiByInstitutionalSectors);
      let iRows = 0;
      while (iRows < rows.length && !hasComputed) {
        const row = rows[iRows];
        let sides;
        let cols;
        const equationsGenerators = [];
        // TODO: customize this segment when copying file content to another (build assignation of equations generators according to current row)
        if (row === "pn" || row === "anaf" || row === "enpf") {
          sides = row === "anaf" ? ["usage"] : ["resource"];
          cols = [["society", "gov", "homes", "st", "rm", "total"]];
          equationsGenerators.push((row, side, col) => {
            const equations = [];
            if (
              col === "st" ||
              col === "homes" ||
              col === "gov" ||
              col === "society"
            ) {
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
            if (col === "rm" || col === "st" || col === "total") {
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
        } else {
          sides = _.endsWith(row, "U") ? ["usage"] : ["resource"];
          cols = [];
          if (row !== "vdaR" && row !== "pccR") {
            cols.push("society");
          }
          if (
            row !== "dldR" &&
            row !== "aopcR" &&
            row !== "vdaU" &&
            row !== "dldU"
          ) {
            cols.push("gov");
          }
          if (_.endsWith(row, "U")) {
            cols.push("homes");
          }
          cols.push("st");
          if (row === "vdaU" || row === "pccU" || _.startsWith(row, "aopc")) {
            cols.push("rm");
          }
          cols.push("total");
          equationsGenerators.push((row, side, col) => {
            const equations = [];
            if (
              col === "st" ||
              col === "homes" ||
              col === "gov" ||
              col === "society"
            ) {
              const equation = [];
              let appendPlus = false;
              if (cols[0].includes("society")) {
                equation.push(genByCol(row, side, col, "society"));
                appendPlus = true;
              }
              if (cols[0].includes("gov")) {
                if (appendPlus) {
                  equation.push("+");
                }
                equation.push(genByCol(row, side, col, "gov"));
                appendPlus = true;
              }
              if (cols[0].includes("homes")) {
                if (appendPlus) {
                  equation.push("+");
                }
                equation.push(genByCol(row, side, col, "homes"));
                appendPlus = true;
              }
              equation.push("=");
              equation.push(genByCol(row, side, col, "st"));
              equations.push(equation);
            }
            if (col === "rm" || col === "st" || col === "total") {
              const equation = [];
              let appendPlus = false;
              if (cols[0].includes("st")) {
                equation.push(genByCol(row, side, col, "st"));
                appendPlus = true;
              }
              if (cols[0].includes("rm")) {
                if (appendPlus) {
                  equation.push("+");
                }
                equation.push(genByCol(row, side, col, "rm"));
                appendPlus = true;
              }
              equation.push("=");
              equation.push(genByCol(row, side, col, "total"));
              equations.push(equation);

              // mirror counter total
              if (
                col === "total" &&
                [
                  "dldU",
                  "dldR",
                  "vdaU",
                  "vdaR",
                  "pccU",
                  "pccR",
                  "aopcU",
                  "aopcR",
                ].includes(row)
              ) {
                equations.push([
                  genByCol(row, side, col, "total"),
                  "=",
                  genByCol(
                    `${row.slice(0, -1)}${_.endsWith(row, "U") ? "R" : "U"}`,
                    side === "usage" ? "resource" : "usage",
                    // TODO: trick for avoiding detecting this column as variable, we need to fix that in the genByCol method
                    null,
                    "total"
                  ),
                ]);
              }
            }
            return equations;
          });
          cols = [cols];
        }
        if (row === "anaf" || _.endsWith(row, "U")) {
          equationsGenerators.push(anaf);
        } else if (row === "enpf" || _.endsWith(row, "R")) {
          equationsGenerators.push(enpf);
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
              console.log({ row, side, col, equations, equationsGenerators });
              while (iEquations < equations.length && !hasComputed) {
                const equation = equations[iEquations];
                if (isEquationSolvable(equation, CuFiByInstitutionalSectors)) {
                  console.log(`Solving ${equation.join(" ")}`);
                  const { leftSide, rightSide } = buildEquationSides(
                    equation,
                    CuFiByInstitutionalSectors
                  );
                  hasComputed = shouldCompute(
                    CuFiByInstitutionalSectors,
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
    saveCuFiByInstitutionalSectorsValues(CuFiByInstitutionalSectors);
  };
  const emptyByInstitutionalSectors = () => {
    saveCuFiByInstitutionalSectorsValues(emptyCuFiByInstitutionalSectors);
  };
  const cellGeneratorForByInstitutionalSectors = new TableInputGenerator(
    CuFiByInstitutionalSectors,
    handleCuFiByInstitutionalSectorsValueChange
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
        currentItem={CuFiByInstitutionalSectors}
        storageKey="cuFiByInstitutionalSectors"
        saveModalTitle="Guardar Cuenta Financiera por Sectores Institucionales"
        loadModalTitle="Cargar Cuenta Financiera por Sectores Institucionales"
        deleteModalTitle="Borrar Cuenta Financiera por Sectores Institucionales"
        deleteModalMessage="¿Está seguro que desea borrar la Cuenta Financiera por Sectores Institucionales?"
        itemSaver={saveCuFiByInstitutionalSectorsValues}
      />
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
            {DisabledCells("pn", 0, 6)}
            <td>
              <strong>Préstamo Neto</strong>
            </td>
            {cellGeneratorForByInstitutionalSectors.generate(
              "pn.resource.society"
            )}
            {cellGeneratorForByInstitutionalSectors.generate("pn.resource.gov")}
            {cellGeneratorForByInstitutionalSectors.generate(
              "pn.resource.homes"
            )}
            {cellGeneratorForByInstitutionalSectors.generate("pn.resource.st")}
            {cellGeneratorForByInstitutionalSectors.generate("pn.resource.rm")}
            {cellGeneratorForByInstitutionalSectors.generate(
              "pn.resource.total"
            )}
          </tr>
          <tr>
            {cellGeneratorForByInstitutionalSectors.generate(
              "anaf.usage.total"
            )}
            {cellGeneratorForByInstitutionalSectors.generate("anaf.usage.rm")}
            {cellGeneratorForByInstitutionalSectors.generate("anaf.usage.st")}
            {cellGeneratorForByInstitutionalSectors.generate(
              "anaf.usage.homes"
            )}
            {cellGeneratorForByInstitutionalSectors.generate("anaf.usage.gov")}
            {cellGeneratorForByInstitutionalSectors.generate(
              "anaf.usage.society"
            )}
            <td>
              <strong>Adquisición Neta de Activos Financieros</strong>
            </td>
            {DisabledCells("anaf", 7, 6)}
          </tr>
          <tr>
            {DisabledCells("enpf", 0, 6)}
            <td>
              <strong>Emisión Neta de pasivos financieros</strong>
            </td>
            {cellGeneratorForByInstitutionalSectors.generate(
              "enpf.resource.society"
            )}
            {cellGeneratorForByInstitutionalSectors.generate(
              "enpf.resource.gov"
            )}
            {cellGeneratorForByInstitutionalSectors.generate(
              "enpf.resource.homes"
            )}
            {cellGeneratorForByInstitutionalSectors.generate(
              "enpf.resource.st"
            )}
            {cellGeneratorForByInstitutionalSectors.generate(
              "enpf.resource.rm"
            )}
            {cellGeneratorForByInstitutionalSectors.generate(
              "enpf.resource.total"
            )}
          </tr>
          <tr>
            {cellGeneratorForByInstitutionalSectors.generate(
              "dldU.usage.total"
            )}
            <DisabledCell />
            {cellGeneratorForByInstitutionalSectors.generate("dldU.usage.st")}
            {cellGeneratorForByInstitutionalSectors.generate(
              "dldU.usage.homes"
            )}
            <DisabledCell />
            {cellGeneratorForByInstitutionalSectors.generate(
              "dldU.usage.society"
            )}
            <td>
              <strong>Dinero Legal y Depósitos</strong>
            </td>
            {cellGeneratorForByInstitutionalSectors.generate(
              "dldR.resource.society"
            )}
            {DisabledCells("dld", 8, 2)}
            {cellGeneratorForByInstitutionalSectors.generate(
              "dldR.resource.st"
            )}
            <DisabledCell />
            {cellGeneratorForByInstitutionalSectors.generate(
              "dldR.resource.total"
            )}
          </tr>
          <tr>
            {cellGeneratorForByInstitutionalSectors.generate(
              "vdaU.usage.total"
            )}
            {cellGeneratorForByInstitutionalSectors.generate("vdaU.usage.rm")}
            {cellGeneratorForByInstitutionalSectors.generate("vdaU.usage.st")}
            {cellGeneratorForByInstitutionalSectors.generate(
              "vdaU.usage.homes"
            )}
            <DisabledCell />
            {cellGeneratorForByInstitutionalSectors.generate(
              "vdaU.usage.society"
            )}
            <td>
              <strong>Valores distintos de acciones</strong>
            </td>
            <DisabledCell />
            {cellGeneratorForByInstitutionalSectors.generate(
              "vdaR.resource.gov"
            )}
            <DisabledCell />
            {cellGeneratorForByInstitutionalSectors.generate(
              "vdaR.resource.st"
            )}
            <DisabledCell />
            {cellGeneratorForByInstitutionalSectors.generate(
              "vdaR.resource.total"
            )}
          </tr>
          <tr>
            {cellGeneratorForByInstitutionalSectors.generate(
              "pccU.usage.total"
            )}
            {cellGeneratorForByInstitutionalSectors.generate("pccU.usage.rm")}
            {cellGeneratorForByInstitutionalSectors.generate("pccU.usage.st")}
            {cellGeneratorForByInstitutionalSectors.generate(
              "pccU.usage.homes"
            )}
            {cellGeneratorForByInstitutionalSectors.generate("pccU.usage.gov")}
            {cellGeneratorForByInstitutionalSectors.generate(
              "pccU.usage.society"
            )}
            <td>
              <strong>Préstamos y crédito comercial</strong>
            </td>
            <DisabledCell />
            {cellGeneratorForByInstitutionalSectors.generate(
              "pccR.resource.gov"
            )}
            <DisabledCell />
            {cellGeneratorForByInstitutionalSectors.generate(
              "pccR.resource.st"
            )}
            <DisabledCell />
            {cellGeneratorForByInstitutionalSectors.generate(
              "pccR.resource.total"
            )}
          </tr>
          <tr>
            {cellGeneratorForByInstitutionalSectors.generate(
              "aopcU.usage.total"
            )}
            {cellGeneratorForByInstitutionalSectors.generate("aopcU.usage.rm")}
            {cellGeneratorForByInstitutionalSectors.generate("aopcU.usage.st")}
            {cellGeneratorForByInstitutionalSectors.generate(
              "aopcU.usage.homes"
            )}
            {cellGeneratorForByInstitutionalSectors.generate("aopcU.usage.gov")}
            {cellGeneratorForByInstitutionalSectors.generate(
              "aopcU.usage.society"
            )}
            <td>
              <strong>Acciones y otras participaciones de capital</strong>
            </td>
            {cellGeneratorForByInstitutionalSectors.generate(
              "aopcR.resource.society"
            )}
            {DisabledCells("aopc", 8, 2)}
            {cellGeneratorForByInstitutionalSectors.generate(
              "aopcR.resource.st"
            )}
            {cellGeneratorForByInstitutionalSectors.generate(
              "aopcR.resource.rm"
            )}
            {cellGeneratorForByInstitutionalSectors.generate(
              "aopcR.resource.total"
            )}
          </tr>
        </tbody>
      </Table>
    </div>
  );
};

export default CuFi;
