import _ from "lodash";
import React, { useState } from "react";
import { Button, Table } from "react-bootstrap";
import DisabledCells from "./DisabledCells";
import DisabledCell from "./DisabledCell";
import { getItem, setItem } from "../shared/db";
import solveEquation from "../shared/solveEquation";
import isEquationSolvable from "../shared/isEquationSolvable";
import buildEquationSides from "../shared/buildEquationSides";
import shouldCompute from "../shared/shouldCompute";
import TableInputGenerator from "./TableInputGenerator";
import CrudModals from "./CrudModals";
import hasContent from "../shared/hasContent";
import setEquationsSubset from "../shared/setEquationsSubset";
import solveEquations from "../shared/solveEquations";

const CuPro = ({ appValues }) => {
  const branches = appValues.branches;
  const branchesIndexes = _.range(1, appValues.branches.length + 1);
  /******************************************************************************/
  const emptyCuProByActivity = {
    productionPerActivity: {
      resource: {
        ...branchesIndexes.reduce((acc, idx) => {
          acc[`branch${idx}`] = "";
          return acc;
        }, {}),
        gov: "",
        total: "",
      },
    },
    intermediateConsumption: {
      usage: {
        ...branchesIndexes.reduce((acc, idx) => {
          acc[`branch${idx}`] = "";
          return acc;
        }, {}),
        gov: "",
        total: "",
      },
    },
    vabPerActivity: {
      usage: {
        ...branchesIndexes.reduce((acc, idx) => {
          acc[`branch${idx}`] = "";
          return acc;
        }, {}),
        gov: "",
        total: "",
      },
    },
    ckf: {
      usage: {
        ...branchesIndexes.reduce((acc, idx) => {
          acc[`branch${idx}`] = "";
          return acc;
        }, {}),
        gov: "",
        total: "",
      },
    },
    vanPerActivity: {
      usage: {
        ...branchesIndexes.reduce((acc, idx) => {
          acc[`branch${idx}`] = "";
          return acc;
        }, {}),
        gov: "",
        total: "",
      },
    },
  };
  const storedCuProByActivity = getItem("cuProByActivity");
  const [CuProByActivity, setCuProByActivity] = useState(
    _.cloneDeep(storedCuProByActivity || emptyCuProByActivity)
  );
  const saveCuProByActivityValues = (content) => {
    setCuProByActivity(_.cloneDeep(content));
    setItem("cuProByActivity", content);
  };
  const handleCuProByActivityValueChange = (value, path) => {
    _.set(CuProByActivity, path, value);
    saveCuProByActivityValues(CuProByActivity);
  };
  const computeByActivity = () => {
    const equations = {};

    const generateEquationBasedOnBranches = (row, col, side) => {
      return branchesIndexes
        .reduce((equationElements, currentBranch) => {
          if (`branch${currentBranch}` === col) {
            equationElements.push("x");
          } else {
            equationElements.push(`${row}.${side}.branch${currentBranch}`);
          }
          equationElements.push("+");
          return equationElements;
        }, [])
        .concat([
          col === "gov" ? "x" : `${row}.${side}.gov`,
          "=",
          col === "total" ? "x" : `${row}.${side}.total`,
        ]);
    };
    const generateEquationInvolvingVanAndCkfAndVab = (row, col) => {
      return [
        row === "vabPerActivity" ? "x" : `vabPerActivity.usage.${col}`,
        "-",
        row === "ckf" ? "x" : `ckf.usage.${col}`,
        "=",
        row === "vanPerActivity" ? "x" : `vanPerActivity.usage.${col}`,
      ];
    };
    const generateEquationInvolvingVanAndCkfAndCiAndProd = (row, col) => {
      return [
        row === "productionPerActivity"
          ? "x"
          : `productionPerActivity.resource.${col}`,
        "-",
        row === "intermediateConsumption"
          ? "x"
          : `intermediateConsumption.usage.${col}`,
        "-",
        row === "ckf" ? "x" : `ckf.usage.${col}`,
        "=",
        row === "vanPerActivity" ? "x" : `vanPerActivity.usage.${col}`,
      ];
    };
    const generateEquationInvolvingVabAndCiAndProd = (row, col) => {
      return [
        row === "productionPerActivity"
          ? "x"
          : `productionPerActivity.resource.${col}`,
        "=",
        row === "intermediateConsumption"
          ? "x"
          : `intermediateConsumption.usage.${col}`,
        "+",
        row === "vabPerActivity" ? "x" : `vabPerActivity.usage.${col}`,
      ];
    };

    Object.keys(emptyCuProByActivity).forEach((row) => {
      if (
        row === "vanPerActivity" ||
        row === "ckf" ||
        row === "vabPerActivity" ||
        row === "intermediateConsumption"
      ) {
        setEquationsSubset(
          branchesIndexes,
          equations,
          row,
          "usage",
          generateEquationBasedOnBranches
        );

        if (
          row === "vanPerActivity" ||
          row === "ckf" ||
          row === "vabPerActivity"
        ) {
          setEquationsSubset(
            branchesIndexes,
            equations,
            row,
            "usage",
            generateEquationInvolvingVanAndCkfAndVab
          );
        }

        if (
          row === "vanPerActivity" ||
          row === "ckf" ||
          row === "intermediateConsumption"
        ) {
          setEquationsSubset(
            branchesIndexes,
            equations,
            row,
            "usage",
            generateEquationInvolvingVanAndCkfAndCiAndProd
          );
        }

        if (row === "vabPerActivity" || row === "intermediateConsumption") {
          setEquationsSubset(
            branchesIndexes,
            equations,
            row,
            "usage",
            generateEquationInvolvingVabAndCiAndProd
          );
        }
      } else {
        setEquationsSubset(
          branchesIndexes,
          equations,
          row,
          "resource",
          generateEquationInvolvingVabAndCiAndProd
        );
      }
    });

    solveEquations(
      equations,
      CuProByActivity,
      saveCuProByActivityValues,
      "Cuenta de Producción por Actividad"
    );
  };
  const emptyByActivity = () => {
    saveCuProByActivityValues(emptyCuProByActivity);
  };
  const retrieveFromCouForByActivity = () => {
    if (!appValues?.cou) {
      alert("No hay valores del COU disponibles para recuperar");
      return;
    }
    // retrieve values from Production row
    branchesIndexes.forEach((idx) => {
      CuProByActivity.productionPerActivity.resource[`branch${idx}`] =
        appValues.cou.production.intermediateUse[`branch${idx}`];
    });
    CuProByActivity.productionPerActivity.resource.gov =
      appValues.cou.production.intermediateUse.gov;
    CuProByActivity.productionPerActivity.resource.total =
      appValues.cou.production.intermediateUse.st;

    // retrieve values from Intermediate Consumption row
    branchesIndexes.forEach((idx) => {
      CuProByActivity.intermediateConsumption.usage[`branch${idx}`] =
        appValues.cou.totalUses.intermediateUse[`branch${idx}`];
    });
    CuProByActivity.intermediateConsumption.usage.gov =
      appValues.cou.totalUses.intermediateUse.gov;
    CuProByActivity.intermediateConsumption.usage.total =
      appValues.cou.totalUses.intermediateUse.st;

    // retrieve values from VAB row
    branchesIndexes.forEach((idx) => {
      CuProByActivity.vabPerActivity.usage[`branch${idx}`] =
        appValues.cou.vab.intermediateUse[`branch${idx}`];
    });
    CuProByActivity.vabPerActivity.usage.gov =
      appValues.cou.vab.intermediateUse.gov;
    CuProByActivity.vabPerActivity.usage.total =
      appValues.cou.vab.intermediateUse.st;

    // retrieve values from CKF row
    branchesIndexes.forEach((idx) => {
      CuProByActivity.ckf.usage[`branch${idx}`] =
        appValues.cou.ckf.intermediateUse[`branch${idx}`];
    });
    CuProByActivity.ckf.usage.gov = appValues.cou.ckf.intermediateUse.gov;
    CuProByActivity.ckf.usage.total = appValues.cou.ckf.intermediateUse.st;

    saveCuProByActivityValues(CuProByActivity);
  };
  const cellGeneratorForByActivities = new TableInputGenerator(
    CuProByActivity,
    handleCuProByActivityValueChange
  );
  /******************************************************************************/
  const emptyCuproByInstitutionalSectors = {
    imports: {
      resource: {
        rm: null,
        total: null,
      },
    },
    exports: {
      usage: {
        rm: null,
        total: null,
      },
    },
    production: {
      resource: {
        society: null,
        gov: null,
        st: null,
        total: null,
      },
    },
    ci: {
      usage: {
        society: null,
        gov: null,
        st: null,
        total: null,
      },
    },
    vab: {
      usage: {
        society: null,
        gov: null,
        st: null,
        total: null,
      },
    },
    ckf: {
      usage: {
        society: null,
        gov: null,
        st: null,
        total: null,
      },
    },
    van: {
      usage: {
        society: null,
        gov: null,
        st: null,
        total: null,
      },
    },
    sbsx: {
      usage: {
        rm: null,
        total: null,
      },
    },
  };
  const storedCuProByInstitutionalSectors = getItem(
    "cuProByInstitutionalSectors"
  );
  const [CuProByInstitutionalSectors, setCuProByInstitutionalSectors] =
    useState(
      _.cloneDeep(
        storedCuProByInstitutionalSectors || emptyCuproByInstitutionalSectors
      )
    );
  const saveCuProByInstitutionalSectorsValues = (content) => {
    setCuProByInstitutionalSectors(_.cloneDeep(content));
    setItem("cuProByInstitutionalSectors", content);
  };
  const handleCuProByInstitutionalSectorsValueChange = (value, path) => {
    _.set(CuProByInstitutionalSectors, path, value);
    saveCuProByInstitutionalSectorsValues(CuProByInstitutionalSectors);
  };
  const computeByInstitutionalSectors = () => {
    console.log("Calculando valores de Cuenta de Producción por Sectores Institucionales");
    const equationInvolvingImportsAndExportsAndSbsx = (row, side, col) => {
      const equations = [];
      equations.push([
        row === "imports" ? "x" : `imports.resource.${col}`,
        "-",
        row === "exports" ? "x" : `exports.usage.${col}`,
        "=",
        row === "sbsx" ? "x" : `sbsx.usage.${col}`,
      ]);
      equations.push([
        col === "rm" ? "x" : `${row}.${side}.rm`,
        "=",
        col === "total" ? "x" : `${row}.${side}.total`,
      ]);
      return equations;
    };
    const equationInvolvingProductionAndCiAndVab = (row, side, col) => {
      const equations = [];
      if (col === "total") {
        equations.push([
          col === "total" ? "x" : `${row}.${side}.total`,
          "=",
          col === "st" ? "x" : `${row}.${side}.st`,
        ]);
      }
      equations.push([
        row === "production" ? "x" : `production.resource.${col}`,
        "-",
        row === "ci" ? "x" : `ci.usage.${col}`,
        "=",
        row === "vab" ? "x" : `vab.usage.${col}`,
      ]);
      return equations;
    };
    const equationInvolvingVabAndCkfAndVan = (row, side, col) => {
      const equations = [];
      if (col === "total") {
        equations.push([
          col === "total" ? "x" : `${row}.${side}.total`,
          "=",
          col === "st" ? "x" : `${row}.${side}.st`,
        ]);
      }
      equations.push([
        row === "vab" ? "x" : `vab.usage.${col}`,
        "-",
        row === "ckf" ? "x" : `ckf.usage.${col}`,
        "=",
        row === "van" ? "x" : `van.usage.${col}`,
      ]);
      return equations;
    };
    let hasComputed = false;
    let maxAmountOfIterations = 100;
    do {
      hasComputed = false;
      const rows = Object.keys(emptyCuproByInstitutionalSectors);
      let iRows = 0;
      while (iRows < rows.length && !hasComputed) {
        const row = rows[iRows];
        let side;
        let cols;
        const equationsGenerators = [];
        if (row === "imports" || row === "exports" || row === "sbsx") {
          side = row === "imports" ? "resource" : "usage";
          cols = ["rm", "total"];
          equationsGenerators.push(equationInvolvingImportsAndExportsAndSbsx);
        } else if (row === "production" || row === "ci") {
          side = row === "production" ? "resource" : "usage";
          cols = ["society", "gov", "st", "total"];
          equationsGenerators.push(equationInvolvingProductionAndCiAndVab);
        } else if (row === "vab") {
          side = "usage";
          cols = ["society", "gov", "st", "total"];
          equationsGenerators.push(
            equationInvolvingProductionAndCiAndVab,
            equationInvolvingVabAndCkfAndVan
          );
        } else if (row === "ckf" || row === "van") {
          side = "usage";
          cols = ["society", "gov", "st", "total"];
          equationsGenerators.push(equationInvolvingVabAndCkfAndVan);
        }
        let iCols = 0;
        while (iCols < cols.length && !hasComputed) {
          const col = cols[iCols];
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
              if (isEquationSolvable(equation, CuProByInstitutionalSectors)) {
                console.log(`Solving ${equation.join(" ")}`);
                const { leftSide, rightSide } = buildEquationSides(
                  equation,
                  CuProByInstitutionalSectors
                );
                hasComputed = shouldCompute(
                  CuProByInstitutionalSectors,
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
        iRows++;
      }
      maxAmountOfIterations--;
    } while (hasComputed && maxAmountOfIterations > 0);
    if (maxAmountOfIterations === 0) {
      alert(
        "Se ha alcanzado el máximo número de iteraciones para calcular la Cuenta de Producción por Sectores Institucionales"
      );
    }
    saveCuProByInstitutionalSectorsValues(CuProByInstitutionalSectors);
  };
  const emptyByInstitutionalSectors = () => {
    saveCuProByInstitutionalSectorsValues(emptyCuproByInstitutionalSectors);
  };
  const retrieveFromCouForByInstitutionalSectors = () => {
    if (!appValues?.cou) {
      alert("No hay valores del COU disponibles para recuperar");
      return;
    }
    CuProByInstitutionalSectors.imports.resource.rm =
      appValues.cou.imports.total;
    CuProByInstitutionalSectors.imports.resource.total =
      appValues.cou.imports.total;
    CuProByInstitutionalSectors.exports.usage.rm =
      appValues.cou.totalUses.finalUse.exports;
    CuProByInstitutionalSectors.exports.usage.total =
      appValues.cou.totalUses.finalUse.exports;
    if (
      _.every(branchesIndexes, (idx) =>
        hasContent(appValues.cou.production.intermediateUse[`branch${idx}`])
      )
    ) {
      CuProByInstitutionalSectors.production.resource.society = _.sum(
        branchesIndexes.map((idx) =>
          _.toNumber(appValues.cou.production.intermediateUse[`branch${idx}`])
        )
      );
    }
    CuProByInstitutionalSectors.production.resource.gov =
      appValues.cou.production.intermediateUse.gov;
    CuProByInstitutionalSectors.production.resource.st =
      appValues.cou.production.intermediateUse.st;
    CuProByInstitutionalSectors.production.resource.total =
      appValues.cou.production.intermediateUse.st;
    if (
      _.every(branchesIndexes, (idx) =>
        hasContent(appValues.cou.totalUses.intermediateUse[`branch${idx}`])
      )
    ) {
      CuProByInstitutionalSectors.ci.usage.society = _.sum(
        branchesIndexes.map((idx) =>
          _.toNumber(appValues.cou.totalUses.intermediateUse[`branch${idx}`])
        )
      );
    }
    CuProByInstitutionalSectors.ci.usage.gov =
      appValues.cou.totalUses.intermediateUse.gov;
    CuProByInstitutionalSectors.ci.usage.st =
      appValues.cou.totalUses.intermediateUse.st;
    CuProByInstitutionalSectors.ci.usage.total =
      appValues.cou.totalUses.intermediateUse.st;
    if (
      _.every(branchesIndexes, (idx) =>
        hasContent(appValues.cou.vab.intermediateUse[`branch${idx}`])
      )
    ) {
      CuProByInstitutionalSectors.vab.usage.society = _.sum(
        branchesIndexes.map((idx) =>
          _.toNumber(appValues.cou.vab.intermediateUse[`branch${idx}`])
        )
      );
    }
    CuProByInstitutionalSectors.vab.usage.gov =
      appValues.cou.vab.intermediateUse.gov;
    CuProByInstitutionalSectors.vab.usage.st =
      appValues.cou.vab.intermediateUse.st;
    CuProByInstitutionalSectors.vab.usage.total =
      appValues.cou.vab.intermediateUse.st;
    if (
      _.every(branchesIndexes, (idx) =>
        hasContent(appValues.cou.ckf.intermediateUse[`branch${idx}`])
      )
    ) {
      CuProByInstitutionalSectors.ckf.usage.society = _.sum(
        branchesIndexes.map((idx) =>
          _.toNumber(appValues.cou.ckf.intermediateUse[`branch${idx}`])
        )
      );
    }
    CuProByInstitutionalSectors.ckf.usage.gov =
      appValues.cou.ckf.intermediateUse.gov;
    CuProByInstitutionalSectors.ckf.usage.st =
      appValues.cou.ckf.intermediateUse.st;
    CuProByInstitutionalSectors.ckf.usage.total =
      appValues.cou.ckf.intermediateUse.st;

    saveCuProByInstitutionalSectorsValues(CuProByInstitutionalSectors);
  };
  const cellGeneratorForByInstitutionalSectors = new TableInputGenerator(
    CuProByInstitutionalSectors,
    handleCuProByInstitutionalSectorsValueChange
  );
  /******************************************************************************/
  return (
    <div>
      <div>
        <h2>Por Actividades</h2>
        <Button variant="primary" onClick={computeByActivity}>
          Calcular
        </Button>
        &nbsp;
        <Button variant="danger" onClick={emptyByActivity}>
          Vaciar
        </Button>
        &nbsp;
        <CrudModals
          currentItem={CuProByActivity}
          storageKey="cuProByActivity"
          saveModalTitle="Guardar Cuenta de Producción por Actividad"
          loadModalTitle="Cargar Cuenta de Producción por Actividad"
          deleteModalTitle="Borrar Cuenta de Producción por Actividad"
          deleteModalMessage="¿Está seguro que desea borrar la Cuenta de Producción por Actividad?"
          itemSaver={saveCuProByActivityValues}
        />
        <Button variant="warning" onClick={retrieveFromCouForByActivity}>
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
              <th colSpan={branches.length + 2}>USOS</th>
              <th rowSpan={2}>Transacciones y otros saldos</th>
              <th colSpan={branches.length + 2}>RECURSOS</th>
            </tr>
            <tr>
              <th>Total</th>
              <th>Gobierno</th>
              {branches.toReversed().map((branch) => {
                return (
                  <th key={`usage_header_${branch.name}}`}>{branch.name}</th>
                );
              })}
              {branches.map((branch) => {
                return (
                  <th key={`resource_header_${branch.name}}`}>{branch.name}</th>
                );
              })}
              <th>Gobierno</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {/* Fila Produccion por actividad */}
            <tr>
              {DisabledCells(
                `usage_productionPerActivity`,
                0,
                branches.length + 2
              )}
              <td>
                <strong>Producción por actividad</strong>
              </td>
              {branchesIndexes.map((idx) => {
                return cellGeneratorForByActivities.generate(
                  `productionPerActivity.resource.branch${idx}`
                );
              })}
              {cellGeneratorForByActivities.generate(
                `productionPerActivity.resource.gov`
              )}
              {cellGeneratorForByActivities.generate(
                `productionPerActivity.resource.total`
              )}
            </tr>

            {/* Fila Consumo Intermedio */}
            <tr>
              {cellGeneratorForByActivities.generate(
                `intermediateConsumption.usage.total`
              )}
              {cellGeneratorForByActivities.generate(
                `intermediateConsumption.usage.gov`
              )}
              {branchesIndexes.toReversed().map((idx) => {
                return cellGeneratorForByActivities.generate(
                  `intermediateConsumption.usage.branch${idx}`
                );
              })}
              <td>
                <strong>Consumo Intermedio</strong>
              </td>
              {DisabledCells(
                `intermediateConsumption_resource`,
                5,
                branches.length + 2
              )}
            </tr>

            {/* Fila Valor Agregado Bruto por Actividad */}
            <tr>
              {cellGeneratorForByActivities.generate(
                `vabPerActivity.usage.total`
              )}
              {cellGeneratorForByActivities.generate(
                `vabPerActivity.usage.gov`
              )}
              {branchesIndexes.toReversed().map((idx) => {
                return cellGeneratorForByActivities.generate(
                  `vabPerActivity.usage.branch${idx}`
                );
              })}
              <td>
                <strong>Valor Agregado Bruto por Actividad</strong>
              </td>
              {DisabledCells(`vabPerActivity_resource`, 5, branches.length + 2)}
            </tr>

            {/* Fila Consumo de Capital Fijo */}
            <tr>
              {cellGeneratorForByActivities.generate(`ckf.usage.total`)}
              {cellGeneratorForByActivities.generate(`ckf.usage.gov`)}
              {branchesIndexes.toReversed().map((idx) => {
                return cellGeneratorForByActivities.generate(
                  `ckf.usage.branch${idx}`
                );
              })}
              <td>
                <strong>Consumo de Capital Fijo</strong>
              </td>
              {DisabledCells(`ckf_resource`, 5, branches.length + 2)}
            </tr>

            {/* Fila Valor Agregado Neto por Actividad */}
            <tr>
              {cellGeneratorForByActivities.generate(
                `vanPerActivity.usage.total`
              )}
              {cellGeneratorForByActivities.generate(
                `vanPerActivity.usage.gov`
              )}
              {branchesIndexes.toReversed().map((idx) => {
                return cellGeneratorForByActivities.generate(
                  `vanPerActivity.usage.branch${idx}`
                );
              })}
              <td>
                <strong>Valor agregado neto por actividad</strong>
              </td>
              {DisabledCells(`vanPerActivity_resource`, 5, branches.length + 2)}
            </tr>
          </tbody>
        </Table>
      </div>
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
          currentItem={CuProByInstitutionalSectors}
          storageKey="cuProByInstitutionalSectors"
          saveModalTitle="Guardar Cuenta de Producción por Sectores Institucionales"
          loadModalTitle="Cargar Cuenta de Producción por Sectores Institucionales"
          deleteModalTitle="Borrar Cuenta de Producción por Sectores Institucionales"
          deleteModalMessage="¿Está seguro que desea borrar la Cuenta de Producción por Sectores Institucionales?"
          itemSaver={saveCuProByInstitutionalSectorsValues}
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
              <th colSpan={5}>USOS</th>
              <th rowSpan={2}>Transacciones y Otros Saldos</th>
              <th colSpan={5}>RECURSOS</th>
            </tr>
            <tr>
              <th>Total</th>
              <th>Resto del Mundo</th>
              <th>SubTotal</th>
              <th>Gobierno</th>
              <th>Sociedades</th>
              <th>Sociedades</th>
              <th>Gobierno</th>
              <th>SubTotal</th>
              <th>Resto del Mundo</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              {DisabledCells("imports", 0, 5)}
              <td>
                <strong>Importaciones de bienes y servicios</strong>
              </td>
              {DisabledCells("imports", 6, 3)}
              {cellGeneratorForByInstitutionalSectors.generate(
                "imports.resource.rm"
              )}
              {cellGeneratorForByInstitutionalSectors.generate(
                "imports.resource.total"
              )}
            </tr>
            <tr>
              {cellGeneratorForByInstitutionalSectors.generate(
                "exports.usage.total"
              )}
              {cellGeneratorForByInstitutionalSectors.generate(
                "exports.usage.rm"
              )}
              {DisabledCells("exports", 3, 3)}
              <td>
                <strong>Exportaciones de bienes y servicios</strong>
              </td>
              {DisabledCells("exports", 6, 5)}
            </tr>
            <tr>
              {DisabledCells("production", 0, 5)}
              <td>
                <strong>Produccion</strong>
              </td>
              {cellGeneratorForByInstitutionalSectors.generate(
                "production.resource.society"
              )}
              {cellGeneratorForByInstitutionalSectors.generate(
                "production.resource.gov"
              )}
              {cellGeneratorForByInstitutionalSectors.generate(
                "production.resource.st"
              )}
              <DisabledCell />
              {cellGeneratorForByInstitutionalSectors.generate(
                "production.resource.total"
              )}
            </tr>
            <tr>
              {cellGeneratorForByInstitutionalSectors.generate(
                "ci.usage.total"
              )}
              <DisabledCell />
              {cellGeneratorForByInstitutionalSectors.generate("ci.usage.st")}
              {cellGeneratorForByInstitutionalSectors.generate("ci.usage.gov")}
              {cellGeneratorForByInstitutionalSectors.generate(
                "ci.usage.society"
              )}
              <td>
                <strong>Consumo Intermedio</strong>
              </td>
              {DisabledCells("ci", 6, 5)}
            </tr>
            <tr>
              {cellGeneratorForByInstitutionalSectors.generate(
                "vab.usage.total"
              )}
              <DisabledCell />
              {cellGeneratorForByInstitutionalSectors.generate("vab.usage.st")}
              {cellGeneratorForByInstitutionalSectors.generate("vab.usage.gov")}
              {cellGeneratorForByInstitutionalSectors.generate(
                "vab.usage.society"
              )}
              <td>
                <strong>Valor Agregado Bruto</strong>
              </td>
              {DisabledCells("vab", 6, 5)}
            </tr>
            <tr>
              {cellGeneratorForByInstitutionalSectors.generate(
                "ckf.usage.total"
              )}
              <DisabledCell />
              {cellGeneratorForByInstitutionalSectors.generate("ckf.usage.st")}
              {cellGeneratorForByInstitutionalSectors.generate("ckf.usage.gov")}
              {cellGeneratorForByInstitutionalSectors.generate(
                "ckf.usage.society"
              )}
              <td>
                <strong>Consumo de Capital Fijo</strong>
              </td>
              {DisabledCells("ckf", 6, 5)}
            </tr>
            <tr>
              {cellGeneratorForByInstitutionalSectors.generate(
                "van.usage.total"
              )}
              <DisabledCell />
              {cellGeneratorForByInstitutionalSectors.generate("van.usage.st")}
              {cellGeneratorForByInstitutionalSectors.generate("van.usage.gov")}
              {cellGeneratorForByInstitutionalSectors.generate(
                "van.usage.society"
              )}
              <td>
                <strong>Valor Agregado Neto</strong>
              </td>
              {DisabledCells("van", 6, 5)}
            </tr>
            <tr>
              {cellGeneratorForByInstitutionalSectors.generate(
                "sbsx.usage.total"
              )}
              {cellGeneratorForByInstitutionalSectors.generate("sbsx.usage.rm")}
              {DisabledCells("sbsx", 3, 3)}
              <td>
                <strong>Saldo de bienes y servicios con el exterior</strong>
              </td>
              {DisabledCells("sbsx", 6, 5)}
            </tr>
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default CuPro;
