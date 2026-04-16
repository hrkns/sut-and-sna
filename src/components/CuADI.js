import React, { useState } from "react";
import _ from "lodash";
import { Button, Table } from "react-bootstrap";
import DisabledCells from "./DisabledCells";
import DisabledCell from "./DisabledCell";
import hasContent from "../shared/hasContent";
import { getItem, setItem } from "../shared/db";
import isEquationSolvable from "../shared/isEquationSolvable";
import buildEquationSides from "../shared/buildEquationSides";
import solveEquation from "../shared/solveEquation";
import shouldCompute from "../shared/shouldCompute";
import TableInputGenerator from "./TableInputGenerator";
import CrudModals from "./CrudModals";
import genByCol from "../shared/genByCol";
import genByRow from "../shared/genByRow";

const CuADI = ({ appValues }) => {
  const branchesIndexes = _.range(1, appValues.branches.length + 1);
  /******************************************************************************/
  const emptyCuADIByInstitutionalSectors = {
    // TODO: customize this object when copying file content to another
    sbsx: {
      resource: {
        rm: null,
        total: null,
      },
    },
    eeb: {
      resource: {
        society: null,
        gov: null,
        st: null,
        total: null,
      },
    },
    ra: {
      resource: {
        homes: null,
        st: null,
        total: null,
      },
    },
    tax: {
      resource: {
        gov: null,
        st: null,
        total: null,
      },
    },
    rp: {
      resource: {
        homes: null,
        st: null,
        rm: null,
        total: null,
      },
      usage: {
        society: null,
        gov: null,
        st: null,
        rm: null,
        total: null,
      },
    },
    cs: {
      resource: {
        gov: null,
        st: null,
        total: null,
      },
      usage: {
        homes: null,
        st: null,
        total: null,
      },
    },
    ps: {
      resource: {
        homes: null,
        st: null,
        total: null,
      },
      usage: {
        gov: null,
        st: null,
        total: null,
      },
    },
    otc: {
      resource: {
        gov: null,
        st: null,
        total: null,
      },
      usage: {
        society: null,
        st: null,
        rm: null,
        total: null,
      },
    },
    idb: {
      usage: {
        society: null,
        gov: null,
        homes: null,
        st: null,
        total: null,
      },
    },
    scx: {
      usage: {
        rm: null,
        total: null,
      },
    },
  };
  const storedCuCuADIByInstitutionalSectors = getItem(
    "cuADIByInstitutionalSectors"
  );
  const [CuADIByInstitutionalSectors, setcuADIByInstitutionalSectors] =
    useState(
      _.cloneDeep(
        storedCuCuADIByInstitutionalSectors || emptyCuADIByInstitutionalSectors
      )
    );
  const savecuADIByInstitutionalSectorsValues = (content) => {
    setcuADIByInstitutionalSectors(_.cloneDeep(content));
    setItem("cuADIByInstitutionalSectors", content);
  };
  const handlecuADIByInstitutionalSectorsValueChange = (value, path) => {
    _.set(CuADIByInstitutionalSectors, path, value);
    savecuADIByInstitutionalSectorsValues(CuADIByInstitutionalSectors);
  };
  const computeByInstitutionalSectors = () => {
    console.log(
      "Calculando valores de Cuenta de Asignación y Distribución de Ingresos por Sectores Institucionales"
    );
    let hasComputed = false;
    let maxAmountOfIterations = 100;
    const scx = (row, side, col) => {
      if (col !== "rm") return [];
      return [
        [
          genByRow(row, "resource", col, "sbsx"),
          "+",
          genByRow(row, "resource", col, "ra"),
          "+",
          genByRow(row, "resource", col, "rp"),
          "-",
          genByRow(row, "usage", col, "rp"),
          "-",
          genByRow(row, "usage", col, "otc"),
          "=",
          genByRow(row, "usage", col, "scx"),
        ],
      ];
    };
    const idb = (row, side, col) => {
      let allowedCols = [];
      if (row === "sbsx") {
        allowedCols = ["total"];
      } else if (row === "eeb") {
        allowedCols = ["society", "gov", "st", "total"];
      } else if (row === "ra") {
        allowedCols = ["homes", "st", "total"];
      } else if (row === "tax") {
        allowedCols = ["gov", "st", "total"];
      } else if (row === "rp") {
        if (side === "resource") {
          allowedCols = ["homes", "st", "total"];
        } else if (side === "usage") {
          allowedCols = ["society", "gov", "st", "total"];
        }
      } else if (row === "cs") {
        if (side === "resource") {
          allowedCols = ["gov", "st", "total"];
        } else if (side === "usage") {
          allowedCols = ["homes", "st", "total"];
        }
      } else if (row === "ps") {
        if (side === "resource") {
          allowedCols = ["homes", "st", "total"];
        } else if (side === "usage") {
          allowedCols = ["gov", "st", "total"];
        }
      } else if (row === "otc") {
        if (side === "resource") {
          allowedCols = ["gov", "st", "total"];
        } else if (side === "usage") {
          allowedCols = ["society", "st", "total"];
        }
      } else if (row === "idb") {
        allowedCols = ["society", "gov", "homes", "st", "total"];
      } else if (row === "scx") {
        allowedCols = ["total"];
      }
      if (!allowedCols.includes(col)) return [];
      const equation = [];
      let addPlus = false;

      if (col === "total") {
        equation.push(genByRow(row, "resource", col, "sbsx"));
        addPlus = true;
      }

      if (
        col === "society" ||
        col === "gov" ||
        col === "st" ||
        col === "total"
      ) {
        if (addPlus) equation.push("+");
        else addPlus = true;
        equation.push(genByRow(row, "resource", col, "eeb", side));
      }

      if (col === "homes" || col === "st" || col === "total") {
        if (addPlus) equation.push("+");
        else addPlus = true;
        equation.push(genByRow(row, "resource", col, "ra", side));
      }

      if (col === "gov" || col === "st" || col === "total") {
        if (addPlus) equation.push("+");
        else addPlus = true;
        equation.push(genByRow(row, "resource", col, "tax", side));
      }

      if (col === "homes" || col === "st" || col === "total") {
        if (addPlus) equation.push("+");
        else addPlus = true;
        equation.push(genByRow(row, "resource", col, "rp", side));
      }

      if (col === "gov" || col === "st" || col === "total") {
        if (addPlus) equation.push("+");
        else addPlus = true;
        equation.push(genByRow(row, "resource", col, "cs", side));
      }

      if (col === "homes" || col === "st" || col === "total") {
        if (addPlus) equation.push("+");
        else addPlus = true;
        equation.push(genByRow(row, "resource", col, "ps", side));
      }

      if (col === "gov" || col === "st" || col === "total") {
        if (addPlus) equation.push("+");
        else addPlus = true;
        equation.push(genByRow(row, "resource", col, "otc", side));
      }

      if (
        col === "society" ||
        col === "gov" ||
        col === "st" ||
        col === "total"
      ) {
        equation.push("-");
        equation.push(genByRow(row, "usage", col, "rp", side));
      }

      if (col === "homes" || col === "st" || col === "total") {
        equation.push("-");
        equation.push(genByRow(row, "usage", col, "cs", side));
      }

      if (col === "gov" || col === "st" || col === "total") {
        equation.push("-");
        equation.push(genByRow(row, "usage", col, "ps", side));
      }

      if (col === "society" || col === "st" || col === "total") {
        equation.push("-");
        equation.push(genByRow(row, "usage", col, "otc", side));
      }

      if (col === "total") {
        equation.push("-");
        equation.push(genByRow(row, "usage", col, "scx", side));
      }

      equation.push("=");
      equation.push(genByRow(row, "usage", col, "idb"));

      return [equation];
    };
    do {
      hasComputed = false;
      const rows = Object.keys(emptyCuADIByInstitutionalSectors);
      let iRows = 0;
      while (iRows < rows.length && !hasComputed) {
        const row = rows[iRows];
        let sides;
        let cols;
        const equationsGenerators = [];
        // TODO: customize this segment when copying file content to another (build assignation of equations generators according to current row)
        if (row === "sbsx") {
          sides = ["resource"];
          cols = [["rm", "total"]];
          equationsGenerators.push((row, side, col) => {
            const equations = [];
            // adding generators of equations based on row calculations
            equations.push([
              genByCol(row, side, col, "rm"),
              "=",
              genByCol(row, side, col, "total"),
            ]);
            return equations;
          });
          equationsGenerators.push(scx);
        } else if (row === "eeb") {
          sides = ["resource"];
          cols = [["society", "gov", "st", "total"]];
          equationsGenerators.push((row, side, col) => {
            const equations = [];
            // adding generators of equations based on row calculations
            if (col === "society" || col === "gov" || col === "st") {
              equations.push([
                genByCol(row, side, col, "society"),
                "+",
                genByCol(row, side, col, "gov"),
                "=",
                genByCol(row, side, col, "st"),
              ]);
            }
            if (col === "st" || col === "total") {
              equations.push([
                genByCol(row, side, col, "st"),
                "=",
                genByCol(row, side, col, "total"),
              ]);
            }
            return equations;
          });
        } else if (row === "ra") {
          sides = ["resource"];
          cols = [["homes", "st", "rm", "total"]];
          // adding generators of equations based on row calculations
          equationsGenerators.push((row, side, col) => {
            const equations = [];
            if (col === "homes" || col === "st") {
              equations.push([
                genByCol(row, side, col, "homes"),
                "=",
                genByCol(row, side, col, "st"),
              ]);
            }
            if (col === "st" || col === "rm" || col === "total") {
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
          equationsGenerators.push(scx);
        } else if (row === "tax") {
          sides = ["resource"];
          cols = [["gov", "st", "total"]];
          equationsGenerators.push((row, side, col) => {
            const equations = [];
            if (col === "gov" || col === "st") {
              equations.push([
                genByCol(row, side, col, "gov"),
                "=",
                genByCol(row, side, col, "st"),
              ]);
            }
            if (col === "st" || col === "total") {
              equations.push([
                genByCol(row, side, col, "st"),
                "=",
                genByCol(row, side, col, "total"),
              ]);
            }
            return equations;
          });
        } else if (row === "rp") {
          sides = ["resource", "usage"];
          cols = [
            ["homes", "st", "rm", "total"],
            ["society", "gov", "st", "rm", "total"],
          ];
          equationsGenerators.push((row, side, col) => {
            const equations = [];
            if (side === "resource") {
              if (col === "homes" || col === "st") {
                equations.push([
                  genByCol(row, side, col, "homes"),
                  "=",
                  genByCol(row, side, col, "st"),
                ]);
              }

              if (col === "st" || col === "rm" || col === "total") {
                equations.push([
                  genByCol(row, side, col, "st"),
                  "+",
                  genByCol(row, side, col, "rm"),
                  "=",
                  genByCol(row, side, col, "total"),
                ]);
              }
            } else if (side === "usage") {
              if (col === "society" || col === "gov" || col === "st") {
                equations.push([
                  genByCol(row, side, col, "society"),
                  "+",
                  genByCol(row, side, col, "gov"),
                  "=",
                  genByCol(row, side, col, "st"),
                ]);
              }
              if (col === "st" || col === "rm" || col === "total") {
                equations.push([
                  genByCol(row, side, col, "st"),
                  "+",
                  genByCol(row, side, col, "rm"),
                  "=",
                  genByCol(row, side, col, "total"),
                ]);
              }
            }
            return equations;
          });
          equationsGenerators.push(scx);
        } else if (row === "cs") {
          sides = ["resource", "usage"];
          cols = [
            ["gov", "st", "total"],
            ["homes", "st", "total"],
          ];
          equationsGenerators.push((row, side, col) => {
            const equations = [];
            if (side === "resource") {
              if (col === "gov" || col === "st") {
                equations.push([
                  genByCol(row, side, col, "gov"),
                  "=",
                  genByCol(row, side, col, "st"),
                ]);
              }
              if (col === "st" || col === "total") {
                equations.push([
                  genByCol(row, side, col, "st"),
                  "=",
                  genByCol(row, side, col, "total"),
                ]);
              }
            } else if (side === "usage") {
              if (col === "homes" || col === "st") {
                equations.push([
                  genByCol(row, side, col, "homes"),
                  "=",
                  genByCol(row, side, col, "st"),
                ]);
              }
              if (col === "st" || col === "total") {
                equations.push([
                  genByCol(row, side, col, "st"),
                  "=",
                  genByCol(row, side, col, "total"),
                ]);
              }
            }
            return equations;
          });
        } else if (row === "ps") {
          sides = ["resource", "usage"];
          cols = [
            ["homes", "st", "total"],
            ["gov", "st", "total"],
          ];
          equationsGenerators.push((row, side, col) => {
            const equations = [];
            if (side === "resource") {
              if (col === "homes" || col === "st") {
                equations.push([
                  genByCol(row, side, col, "homes"),
                  "=",
                  genByCol(row, side, col, "st"),
                ]);
              }
              if (col === "st" || col === "total") {
                equations.push([
                  genByCol(row, side, col, "st"),
                  "=",
                  genByCol(row, side, col, "total"),
                ]);
              }
            } else if (side === "usage") {
              if (col === "gov" || col === "st") {
                equations.push([
                  genByCol(row, side, col, "gov"),
                  "=",
                  genByCol(row, side, col, "st"),
                ]);
              }
              if (col === "st" || col === "total") {
                equations.push([
                  genByCol(row, side, col, "st"),
                  "=",
                  genByCol(row, side, col, "total"),
                ]);
              }
            }
            return equations;
          });
        } else if (row === "otc") {
          sides = ["resource", "usage"];
          cols = [
            ["gov", "st", "total"],
            ["society", "st", "rm", "total"],
          ];
          equationsGenerators.push((row, side, col) => {
            const equations = [];
            if (side === "resource") {
              if (col === "gov" || col === "st") {
                equations.push([
                  genByCol(row, side, col, "gov"),
                  "=",
                  genByCol(row, side, col, "st"),
                ]);
              }
              if (col === "st" || col === "total") {
                equations.push([
                  genByCol(row, side, col, "st"),
                  "=",
                  genByCol(row, side, col, "total"),
                ]);
              }
            } else if (side === "usage") {
              if (col === "society" || col === "st") {
                equations.push([
                  genByCol(row, side, col, "society"),
                  "=",
                  genByCol(row, side, col, "st"),
                ]);
              }
              if (col === "st" || col === "rm" || col === "total") {
                equations.push([
                  genByCol(row, side, col, "st"),
                  "+",
                  genByCol(row, side, col, "rm"),
                  "=",
                  genByCol(row, side, col, "total"),
                ]);
              }
            }
            return equations;
          });
          equationsGenerators.push(scx);
        } else if (row === "idb") {
          sides = ["usage"];
          cols = [["society", "gov", "homes", "st", "total"]];
          equationsGenerators.push((row, side, col) => {
            const equations = [];
            if (
              col === "society" ||
              col === "gov" ||
              col === "homes" ||
              col === "st"
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
            if (col === "st" || col === "total") {
              equations.push([
                genByCol(row, side, col, "st"),
                "=",
                genByCol(row, side, col, "total"),
              ]);
            }
            return equations;
          });
        } else if (row === "scx") {
          sides = ["usage"];
          cols = [["rm", "total"]];
          equationsGenerators.push((row, side, col) => {
            const equations = [];
            if (col === "rm" || col === "total") {
              equations.push([
                genByCol(row, side, col, "rm"),
                "=",
                genByCol(row, side, col, "total"),
              ]);
            }
            return equations;
          });
          equationsGenerators.push(scx);
        }
        equationsGenerators.push(idb);
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
                if (isEquationSolvable(equation, CuADIByInstitutionalSectors)) {
                  console.log(`Solving ${equation.join(" ")}`);
                  const { leftSide, rightSide } = buildEquationSides(
                    equation,
                    CuADIByInstitutionalSectors
                  );
                  hasComputed = shouldCompute(
                    CuADIByInstitutionalSectors,
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
        "Se ha alcanzado el máximo número de iteraciones para calcular la Cuenta de Asignación y Distribución de Ingresos por Sectores Institucionales"
      );
    }
    savecuADIByInstitutionalSectorsValues(CuADIByInstitutionalSectors);
  };
  const emptyByInstitutionalSectors = () => {
    savecuADIByInstitutionalSectorsValues(emptyCuADIByInstitutionalSectors);
  };
  const retrieveFromCouForByInstitutionalSectors = () => {
    if (!appValues?.cou) {
      alert("No hay valores del COU disponibles para recuperar");
      return;
    }
    // TODO: customize this segment when copying file content to another (implement retriveing and computing values from COU)

    // Saldo de Balanza Comercial
    if (
      hasContent(appValues.cou.imports.total) &&
      hasContent(appValues.cou.totalUses.finalUse.exports)
    ) {
      const val = -(
        _.toNumber(appValues.cou.totalUses.finalUse.exports) -
        _.toNumber(appValues.cou.imports.total)
      );
      CuADIByInstitutionalSectors.sbsx.resource.rm = val;
      CuADIByInstitutionalSectors.sbsx.resource.total = val;
      CuADIByInstitutionalSectors.sbsx.resource.rm = val;
      CuADIByInstitutionalSectors.sbsx.resource.total = val;
    }

    // EEB
    if (
      _.every(
        branchesIndexes,
        (idx) =>
          hasContent(appValues.cou.een.intermediateUse[`branch${idx}`]) &&
          hasContent(appValues.cou.ckf.intermediateUse[`branch${idx}`])
      )
    ) {
      CuADIByInstitutionalSectors.eeb.resource.society = _.sum(
        branchesIndexes.map(
          (idx) =>
            _.toNumber(appValues.cou.een.intermediateUse[`branch${idx}`]) +
            _.toNumber(appValues.cou.ckf.intermediateUse[`branch${idx}`])
        )
      );
    }
    CuADIByInstitutionalSectors.eeb.resource.gov =
      _.toNumber(appValues.cou.een.intermediateUse.gov) +
      _.toNumber(appValues.cou.ckf.intermediateUse.gov);
    CuADIByInstitutionalSectors.eeb.resource.st =
      _.toNumber(appValues.cou.een.intermediateUse.st) +
      _.toNumber(appValues.cou.ckf.intermediateUse.st);
    CuADIByInstitutionalSectors.eeb.resource.total =
      _.toNumber(appValues.cou.een.intermediateUse.st) +
      _.toNumber(appValues.cou.ckf.intermediateUse.st);

    // RA
    CuADIByInstitutionalSectors.ra.resource.total =
      appValues.cou.ra.intermediateUse.st;

    // Taxes
    CuADIByInstitutionalSectors.tax.resource.gov =
      appValues.cou.tax.intermediateUse.st;
    CuADIByInstitutionalSectors.tax.resource.st =
      appValues.cou.tax.intermediateUse.st;
    CuADIByInstitutionalSectors.tax.resource.total =
      appValues.cou.tax.intermediateUse.st;

    savecuADIByInstitutionalSectorsValues(CuADIByInstitutionalSectors);
  };
  const cellGeneratorForByInstitutionalSectors = new TableInputGenerator(
    CuADIByInstitutionalSectors,
    handlecuADIByInstitutionalSectorsValueChange
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
        currentItem={CuADIByInstitutionalSectors}
        storageKey="cuADIByInstitutionalSectors"
        saveModalTitle="Guardar Cuenta de Asignación y Distribución de Ingresos por Sectores Institucionales"
        loadModalTitle="Cargar Cuenta de Asignación y Distribución de Ingresos por Sectores Institucionales"
        deleteModalTitle="Borrar Cuenta de Asignación y Distribución de Ingresos por Sectores Institucionales"
        deleteModalMessage="¿Está seguro que desea borrar la Cuenta de Asignación y Distribución de Ingresos por Sectores Institucionales?"
        itemSaver={savecuADIByInstitutionalSectorsValues}
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
            <th>Gobierno General</th>
            <th>Sociedades</th>
            <th>Sociedades</th>
            <th>Gobierno General</th>
            <th>Hogares</th>
            <th>SubTotal</th>
            <th>Resto del Mundo</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            {DisabledCells(`sbsx`, 0, 6)}
            <td>
              <strong>Saldo de bienes y servicios con el exterior</strong>
            </td>
            {DisabledCells(`sbsx`, 7, 4)}
            {cellGeneratorForByInstitutionalSectors.generate(
              "sbsx.resource.rm"
            )}
            {cellGeneratorForByInstitutionalSectors.generate(
              "sbsx.resource.total"
            )}
          </tr>
          <tr>
            {DisabledCells(`eeb`, 0, 6)}
            <td>
              <strong>Excedente de Explotación Bruto</strong>
            </td>
            {cellGeneratorForByInstitutionalSectors.generate(
              "eeb.resource.society"
            )}
            {cellGeneratorForByInstitutionalSectors.generate(
              "eeb.resource.gov"
            )}
            <DisabledCell />
            {cellGeneratorForByInstitutionalSectors.generate("eeb.resource.st")}
            <DisabledCell />
            {cellGeneratorForByInstitutionalSectors.generate(
              "eeb.resource.total"
            )}
          </tr>
          <tr>
            {DisabledCells(`ra`, 0, 6)}
            <td>
              <strong>Remuneración de Asalariados</strong>
            </td>
            {DisabledCells(`ra`, 7, 2)}
            {cellGeneratorForByInstitutionalSectors.generate(
              "ra.resource.homes"
            )}
            {cellGeneratorForByInstitutionalSectors.generate("ra.resource.st")}
            {cellGeneratorForByInstitutionalSectors.generate("ra.resource.rm")}
            {cellGeneratorForByInstitutionalSectors.generate(
              "ra.resource.total"
            )}
          </tr>
          <tr>
            {DisabledCells(`tax`, 0, 6)}
            <td>
              <strong>Impuestos - Subsidios producción</strong>
            </td>
            <DisabledCell />
            {cellGeneratorForByInstitutionalSectors.generate(
              "tax.resource.gov"
            )}
            <DisabledCell />
            {cellGeneratorForByInstitutionalSectors.generate("tax.resource.st")}
            <DisabledCell />
            {cellGeneratorForByInstitutionalSectors.generate(
              "tax.resource.total"
            )}
          </tr>
          <tr>
            {cellGeneratorForByInstitutionalSectors.generate("rp.usage.total")}
            {cellGeneratorForByInstitutionalSectors.generate("rp.usage.rm")}
            {cellGeneratorForByInstitutionalSectors.generate("rp.usage.st")}
            <DisabledCell />
            {cellGeneratorForByInstitutionalSectors.generate("rp.usage.gov")}
            {cellGeneratorForByInstitutionalSectors.generate("rp.usage.soc")}
            <td>
              <strong>Rentas de la propiedad</strong>
            </td>
            {DisabledCells(`rp`, 7, 2)}
            {cellGeneratorForByInstitutionalSectors.generate(
              "rp.resource.homes"
            )}
            {cellGeneratorForByInstitutionalSectors.generate("rp.resource.st")}
            {cellGeneratorForByInstitutionalSectors.generate("rp.resource.rm")}
            {cellGeneratorForByInstitutionalSectors.generate(
              "rp.resource.total"
            )}
          </tr>
          <tr>
            {cellGeneratorForByInstitutionalSectors.generate("cs.usage.total")}
            <DisabledCell />
            {cellGeneratorForByInstitutionalSectors.generate("cs.usage.st")}
            {cellGeneratorForByInstitutionalSectors.generate("cs.usage.homes")}
            {DisabledCells(`cs`, 4, 2)}
            <td>
              <strong>Contribuciones sociales</strong>
            </td>
            <DisabledCell />
            {cellGeneratorForByInstitutionalSectors.generate("cs.resource.gov")}
            <DisabledCell />
            {cellGeneratorForByInstitutionalSectors.generate("cs.resource.st")}
            <DisabledCell />
            {cellGeneratorForByInstitutionalSectors.generate(
              "cs.resource.total"
            )}
          </tr>
          <tr>
            {cellGeneratorForByInstitutionalSectors.generate("ps.usage.total")}
            <DisabledCell />
            {cellGeneratorForByInstitutionalSectors.generate("ps.usage.st")}
            <DisabledCell />
            {cellGeneratorForByInstitutionalSectors.generate("ps.usage.gov")}
            <DisabledCell />
            <td>
              <strong>Prestaciones sociales</strong>
            </td>
            {DisabledCells(`ps`, 7, 2)}
            {cellGeneratorForByInstitutionalSectors.generate(
              "ps.resource.homes"
            )}
            {cellGeneratorForByInstitutionalSectors.generate("ps.resource.st")}
            <DisabledCell />
            {cellGeneratorForByInstitutionalSectors.generate(
              "ps.resource.total"
            )}
          </tr>
          <tr>
            {cellGeneratorForByInstitutionalSectors.generate("otc.usage.total")}
            {cellGeneratorForByInstitutionalSectors.generate("otc.usage.rm")}
            {cellGeneratorForByInstitutionalSectors.generate("otc.usage.st")}
            {DisabledCells(`otc`, 3, 2)}
            {cellGeneratorForByInstitutionalSectors.generate(
              "otc.usage.society"
            )}
            <td>
              <strong>Otras transferencias corrientes</strong>
            </td>
            <DisabledCell />
            {cellGeneratorForByInstitutionalSectors.generate(
              "otc.resource.gov"
            )}
            <DisabledCell />
            {cellGeneratorForByInstitutionalSectors.generate("otc.resource.st")}
            <DisabledCell />
            {cellGeneratorForByInstitutionalSectors.generate(
              "otc.resource.total"
            )}
          </tr>
          <tr>
            {cellGeneratorForByInstitutionalSectors.generate("idb.usage.total")}
            <DisabledCell />
            {cellGeneratorForByInstitutionalSectors.generate("idb.usage.st")}
            {cellGeneratorForByInstitutionalSectors.generate("idb.usage.homes")}
            {cellGeneratorForByInstitutionalSectors.generate("idb.usage.gov")}
            {cellGeneratorForByInstitutionalSectors.generate(
              "idb.usage.society"
            )}
            <td>
              <strong>Ingreso Disponible Bruto</strong>
            </td>
            {DisabledCells(`idb`, 6, 6)}
          </tr>
          <tr>
            {cellGeneratorForByInstitutionalSectors.generate("scx.usage.total")}
            {cellGeneratorForByInstitutionalSectors.generate("scx.usage.rm")}
            {DisabledCells(`scx`, 2, 4)}
            <td>
              <strong>Saldo Corriente con el Exterior</strong>
            </td>
            {DisabledCells(`scx`, 6, 6)}
          </tr>
        </tbody>
      </Table>
    </div>
  );
};

export default CuADI;
