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
import setEquationsSubset from "../shared/setEquationsSubset";
import solveEquations from "../shared/solveEquations";

const CuGeI = ({ appValues }) => {
  const branches = appValues.branches;
  const branchesIndexes = _.range(1, appValues.branches.length + 1);
  /******************************************************************************/
  const emptyCuGeIByActivity = {
    vabPerActivity: {
      resource: {
        ...branchesIndexes.reduce((acc, idx) => {
          acc[`branch${idx}`] = "";
          return acc;
        }, {}),
        gov: "",
        total: "",
      },
    },
    ra: {
      usage: {
        ...branchesIndexes.reduce((acc, idx) => {
          acc[`branch${idx}`] = "";
          return acc;
        }, {}),
        gov: "",
        total: "",
      },
    },
    tax: {
      usage: {
        ...branchesIndexes.reduce((acc, idx) => {
          acc[`branch${idx}`] = "";
          return acc;
        }, {}),
        gov: "",
        total: "",
      },
    },
    eeb: {
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
  const storedCuGeIByActivity = getItem("cuGeIByActivity");
  const [CuGeIByActivity, setCuGeIByActivity] = useState(
    _.cloneDeep(storedCuGeIByActivity || emptyCuGeIByActivity)
  );
  const saveCuGeIByActivityValues = (content) => {
    setCuGeIByActivity(_.cloneDeep(content));
    setItem("cuGeIByActivity", content);
  };
  const handleCuGeIByActivityValueChange = (value, path) => {
    _.set(CuGeIByActivity, path, value);
    saveCuGeIByActivityValues(CuGeIByActivity);
  };
  const computeByActivity = () => {
    const equations = {};

    const vabEqualRaPlusTaxPlusEeb = (row, col) => {
      if (row === "tax" && col === "gov") return null;
      return [
        row === "vabPerActivity" ? "x" : `vabPerActivity.resource.${col}`,
        "=",
        row === "ra" ? "x" : `ra.usage.${col}`,
        "+",
        col === "gov" ? null : row === "tax" ? "x" : `tax.usage.${col}`,
        col === "gov" ? null : "+",
        row === "eeb" ? "x" : `eeb.usage.${col}`,
      ].filter((x) => x);
    };

    Object.keys(emptyCuGeIByActivity).forEach((row) => {
      setEquationsSubset(
        branchesIndexes,
        equations,
        row,
        row === "vabPerActivity" ? "resource" : "usage",
        vabEqualRaPlusTaxPlusEeb
      );
    });

    solveEquations(
      equations,
      CuGeIByActivity,
      saveCuGeIByActivityValues,
      "Cuenta de Generación de Ingresos por Actividad"
    );
  };
  const emptyByActivity = () => {
    saveCuGeIByActivityValues(emptyCuGeIByActivity);
  };
  const retrieveFromCouForByActivity = () => {
    if (!appValues?.cou) {
      alert("No hay valores del COU disponibles para recuperar");
      return;
    }
    // retrieve values from VAB row
    if (
      _.every(branchesIndexes, (idx) =>
        hasContent(appValues.cou.vab.intermediateUse[`branch${idx}`])
      )
    ) {
      branchesIndexes.forEach((idx) => {
        CuGeIByActivity.vabPerActivity.resource[`branch${idx}`] =
          appValues.cou.vab.intermediateUse[`branch${idx}`];
      });
    }
    CuGeIByActivity.vabPerActivity.resource.gov =
      appValues.cou.vab.intermediateUse.gov;
    CuGeIByActivity.vabPerActivity.resource.total =
      appValues.cou.vab.intermediateUse.st;

    // retrieve values from RA row

    if (
      _.every(branchesIndexes, (idx) =>
        hasContent(appValues.cou.ra.intermediateUse[`branch${idx}`])
      )
    ) {
      branchesIndexes.forEach((idx) => {
        CuGeIByActivity.ra.usage[`branch${idx}`] =
          appValues.cou.ra.intermediateUse[`branch${idx}`];
      });
    }
    CuGeIByActivity.ra.usage.gov = appValues.cou.ra.intermediateUse.gov;
    CuGeIByActivity.ra.usage.total = appValues.cou.ra.intermediateUse.st;

    // retrieve values from TAX row
    if (
      _.every(branchesIndexes, (idx) =>
        hasContent(appValues.cou.tax.intermediateUse[`branch${idx}`])
      )
    ) {
      branchesIndexes.forEach((idx) => {
        CuGeIByActivity.tax.usage[`branch${idx}`] =
          appValues.cou.tax.intermediateUse[`branch${idx}`];
      });
    }
    CuGeIByActivity.tax.usage.gov = appValues.cou.tax.intermediateUse.gov;
    CuGeIByActivity.tax.usage.total = appValues.cou.tax.intermediateUse.st;

    // retrieve values for EEB row
    if (
      _.every(
        branchesIndexes,
        (idx) =>
          hasContent(appValues.cou.een.intermediateUse[`branch${idx}`]) &&
          hasContent(appValues.cou.ckf.intermediateUse[`branch${idx}`])
      )
    ) {
      branchesIndexes.forEach((idx) => {
        CuGeIByActivity.eeb.usage[`branch${idx}`] =
          _.toNumber(appValues.cou.een.intermediateUse[`branch${idx}`]) +
          _.toNumber(appValues.cou.ckf.intermediateUse[`branch${idx}`]);
      });
    }
    CuGeIByActivity.eeb.usage.gov =
      _.toNumber(appValues.cou.ckf.intermediateUse.gov) +
      _.toNumber(appValues.cou.een.intermediateUse.gov);
    CuGeIByActivity.eeb.usage.total =
      _.toNumber(appValues.cou.ckf.intermediateUse.st) +
      _.toNumber(appValues.cou.een.intermediateUse.st);

    saveCuGeIByActivityValues(CuGeIByActivity);
  };
  const cellGeneratorForByActivities = new TableInputGenerator(
    CuGeIByActivity,
    handleCuGeIByActivityValueChange
  );
  /******************************************************************************/
  const emptyCuGeIByInstitutionalSectors = {
    sbsxR: {
      resource: {
        rm: null,
        total: null,
      },
    },
    vab: {
      resource: {
        society: null,
        gov: null,
        st: null,
      },
    },
    ra: {
      usage: {
        society: null,
        gov: null,
        st: null,
        total: null,
      },
    },
    tax: {
      usage: {
        society: null,
        st: null,
        total: null,
      },
    },
    eeb: {
      usage: {
        society: null,
        gov: null,
        st: null,
        total: null,
      },
    },
    sbsxU: {
      usage: {
        rm: null,
        total: null,
      },
    },
  };
  const storedCuGeIByInstitutionalSectors = getItem(
    "cuGeIByInstitutionalSectors"
  );
  const [CuGeIByInstitutionalSectors, setCuGeIByInstitutionalSectors] =
    useState(
      _.cloneDeep(
        storedCuGeIByInstitutionalSectors || emptyCuGeIByInstitutionalSectors
      )
    );
  const saveCuGeIByInstitutionalSectorsValues = (content) => {
    setCuGeIByInstitutionalSectors(_.cloneDeep(content));
    setItem("cuGeIByInstitutionalSectors", content);
  };
  const handleCuGeIByInstitutionalSectorsValueChange = (value, path) => {
    _.set(CuGeIByInstitutionalSectors, path, value);
    saveCuGeIByInstitutionalSectorsValues(CuGeIByInstitutionalSectors);
  };
  const computeByInstitutionalSectors = () => {
    console.log(
      "Calculando valores de Cuenta de Generación de Ingresos por Sectores Institucionales"
    );
    const sbsxByRow = (row, side, col) => {
      return [
        [
          col === "rm" ? "x" : `sbsxR.${side}.rm`,
          "=",
          col === "total" ? "x" : `sbsxU.${side}.total`,
        ],
      ];
    };
    const sbsxByCol = (row, side, col) => {
      return [
        [
          row === "sbsxR" ? "x" : `sbsxR.resource.${col}`,
          "=",
          row === "sbsxU" ? "x" : `sbsxU.usage.${col}`,
        ],
      ];
    };
    const vabOrRaOrTaxOrEebByRow = (row, side, col) => {
      const equation = [];
      const equations = [];

      if (col === "total") {
        equation.push("x", "=", `${row}.${side}.st`);
      } else {
        equation.push(col === "society" ? "x" : `${row}.${side}.society`);
        if (row !== "tax") {
          equation.push("+");
          equation.push(col === "gov" ? "x" : `${row}.${side}.gov`);
        }
        equation.push("=");
        equation.push(col === "st" ? "x" : `${row}.${side}.st`);
        equations.push(equation);
        if (col === "st") {
          equations.push([`x`, "=", `${row}.${side}.total`]);
        }
      }

      return equations;
    };
    const vabOrRaOrTaxOrEebByCol = (row, side, col) => {
      const equation = [];

      equation.push(row === "vab" ? "x" : `vab.resource.${col}`);
      equation.push("=");
      equation.push(row === "ra" ? "x" : `ra.usage.${col}`);
      if (col !== "gov") {
        equation.push("+");
        equation.push(row === "tax" ? "x" : `tax.usage.${col}`);
      }
      equation.push("+");
      equation.push(row === "eeb" ? "x" : `eeb.usage.${col}`);

      return [equation];
    };
    let hasComputed = false;
    let maxAmountOfIterations = 100;
    do {
      hasComputed = false;
      const rows = Object.keys(emptyCuGeIByInstitutionalSectors);
      let iRows = 0;
      while (iRows < rows.length && !hasComputed) {
        const row = rows[iRows];
        let side;
        let cols;
        const equationsGenerators = [];
        if (row === "sbsxR") {
          side = "resource";
          cols = ["rm", "total"];
          equationsGenerators.push(sbsxByRow, sbsxByCol);
        } else if (row === "vab") {
          side = "resource";
          cols = ["society", "gov", "st", "total"];
          equationsGenerators.push(
            vabOrRaOrTaxOrEebByRow,
            vabOrRaOrTaxOrEebByCol
          );
        } else if (row === "ra") {
          side = "usage";
          cols = ["society", "gov", "st", "total"];
          equationsGenerators.push(
            vabOrRaOrTaxOrEebByRow,
            vabOrRaOrTaxOrEebByCol
          );
        } else if (row === "tax") {
          side = "usage";
          cols = ["society", "st", "total"];
          equationsGenerators.push(
            vabOrRaOrTaxOrEebByRow,
            vabOrRaOrTaxOrEebByCol
          );
        } else if (row === "eeb") {
          side = "usage";
          cols = ["society", "gov", "st", "total"];
          equationsGenerators.push(
            vabOrRaOrTaxOrEebByRow,
            vabOrRaOrTaxOrEebByCol
          );
        } else if (row === "sbsxU") {
          side = "usage";
          cols = ["rm", "total"];
          equationsGenerators.push(sbsxByRow, sbsxByCol);
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
              if (isEquationSolvable(equation, CuGeIByInstitutionalSectors)) {
                console.log(`Solving ${equation.join(" ")}`);
                const { leftSide, rightSide } = buildEquationSides(
                  equation,
                  CuGeIByInstitutionalSectors
                );
                hasComputed = shouldCompute(
                  CuGeIByInstitutionalSectors,
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
        "Se ha alcanzado el máximo número de iteraciones para calcular la Cuenta de Generación de Ingresos por Sectores Institucionales"
      );
    }
    saveCuGeIByInstitutionalSectorsValues(CuGeIByInstitutionalSectors);
  };
  const emptyByInstitutionalSectors = () => {
    saveCuGeIByInstitutionalSectorsValues(emptyCuGeIByInstitutionalSectors);
  };
  const retrieveFromCouForByInstitutionalSectors = () => {
    if (!appValues?.cou) {
      alert("No hay valores del COU disponibles para recuperar");
      return;
    }
    // Saldo de Balanza Comercial
    if (
      hasContent(appValues.cou.imports.total) &&
      hasContent(appValues.cou.totalUses.finalUse.exports)
    ) {
      const val = -(
        _.toNumber(appValues.cou.totalUses.finalUse.exports) -
        _.toNumber(appValues.cou.imports.total)
      );
      CuGeIByInstitutionalSectors.sbsxR.resource.rm = val;
      CuGeIByInstitutionalSectors.sbsxR.resource.total = val;
      CuGeIByInstitutionalSectors.sbsxU.usage.rm = val;
      CuGeIByInstitutionalSectors.sbsxU.usage.total = val;
    }

    // VAB
    if (
      _.every(branchesIndexes, (idx) =>
        hasContent(appValues.cou.vab.intermediateUse[`branch${idx}`])
      )
    ) {
      CuGeIByInstitutionalSectors.vab.resource.society = _.sum(
        branchesIndexes.map((idx) =>
          _.toNumber(appValues.cou.vab.intermediateUse[`branch${idx}`])
        )
      );
    }
    CuGeIByInstitutionalSectors.vab.resource.gov =
      appValues.cou.vab.intermediateUse.gov;
    CuGeIByInstitutionalSectors.vab.resource.st =
      appValues.cou.vab.intermediateUse.st;
    CuGeIByInstitutionalSectors.vab.resource.total =
      appValues.cou.vab.intermediateUse.st;

    // RA
    if (
      _.every(branchesIndexes, (idx) =>
        hasContent(appValues.cou.ra.intermediateUse[`branch${idx}`])
      )
    ) {
      CuGeIByInstitutionalSectors.ra.usage.society = _.sum(
        branchesIndexes.map((idx) =>
          _.toNumber(appValues.cou.ra.intermediateUse[`branch${idx}`])
        )
      );
    }
    CuGeIByInstitutionalSectors.ra.usage.gov =
      appValues.cou.ra.intermediateUse.gov;
    CuGeIByInstitutionalSectors.ra.usage.st =
      appValues.cou.ra.intermediateUse.st;
    CuGeIByInstitutionalSectors.ra.usage.total =
      appValues.cou.ra.intermediateUse.st;

    // Taxes
    if (
      _.every(branchesIndexes, (idx) =>
        hasContent(appValues.cou.tax.intermediateUse[`branch${idx}`])
      )
    ) {
      CuGeIByInstitutionalSectors.tax.usage.society = _.sum(
        branchesIndexes.map((idx) =>
          _.toNumber(appValues.cou.tax.intermediateUse[`branch${idx}`])
        )
      );
    }
    CuGeIByInstitutionalSectors.tax.usage.st =
      appValues.cou.tax.intermediateUse.st;
    CuGeIByInstitutionalSectors.tax.usage.total =
      appValues.cou.tax.intermediateUse.st;

    // EEB
    if (
      _.every(
        branchesIndexes,
        (idx) =>
          hasContent(appValues.cou.een.intermediateUse[`branch${idx}`]) &&
          hasContent(appValues.cou.ckf.intermediateUse[`branch${idx}`])
      )
    ) {
      CuGeIByInstitutionalSectors.eeb.usage.society = _.sum(
        branchesIndexes.map(
          (idx) =>
            _.toNumber(appValues.cou.een.intermediateUse[`branch${idx}`]) +
            _.toNumber(appValues.cou.ckf.intermediateUse[`branch${idx}`])
        )
      );
    }
    CuGeIByInstitutionalSectors.eeb.usage.gov =
      _.toNumber(appValues.cou.een.intermediateUse.gov) +
      _.toNumber(appValues.cou.ckf.intermediateUse.gov);
    CuGeIByInstitutionalSectors.eeb.usage.st =
      _.toNumber(appValues.cou.een.intermediateUse.st) +
      _.toNumber(appValues.cou.ckf.intermediateUse.st);
    CuGeIByInstitutionalSectors.eeb.usage.total =
      _.toNumber(appValues.cou.een.intermediateUse.st) +
      _.toNumber(appValues.cou.ckf.intermediateUse.st);

    saveCuGeIByInstitutionalSectorsValues(CuGeIByInstitutionalSectors);
  };
  const cellGeneratorForByInstitutionalSectors = new TableInputGenerator(
    CuGeIByInstitutionalSectors,
    handleCuGeIByInstitutionalSectorsValueChange
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
          currentItem={CuGeIByActivity}
          storageKey="cuGeIByActivity"
          saveModalTitle="Guardar Cuenta de Generación de Ingresos por Actividad"
          loadModalTitle="Cargar Cuenta de Generación de Ingresos por Actividad"
          deleteModalTitle="Borrar Cuenta de Generación de Ingresos por Actividad"
          deleteModalMessage="¿Está seguro que desea borrar la Cuenta de Generación de Ingresos por Actividad?"
          itemSaver={saveCuGeIByActivityValues}
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
            {/* Fila Valor Agregado Bruto por Actividad */}
            <tr>
              {DisabledCells(`resource_vab`, 0, branches.length + 2)}
              <td>
                <strong>Valor Agregado Bruto por actividad</strong>
              </td>
              {branchesIndexes.map((idx) => {
                return cellGeneratorForByActivities.generate(
                  `vabPerActivity.resource.branch${idx}`
                );
              })}
              {cellGeneratorForByActivities.generate(
                `vabPerActivity.resource.gov`
              )}
              {cellGeneratorForByActivities.generate(
                `vabPerActivity.resource.total`
              )}
            </tr>

            {/* Fila Remuneración de Asalariados */}
            <tr>
              {cellGeneratorForByActivities.generate(`ra.usage.total`)}
              {cellGeneratorForByActivities.generate(`ra.usage.gov`)}
              {branchesIndexes.toReversed().map((idx) => {
                return cellGeneratorForByActivities.generate(
                  `ra.usage.branch${idx}`
                );
              })}
              <td>
                <strong>Remuneración de Asalariados</strong>
              </td>
              {DisabledCells(`usage_ra_`, 5, branches.length + 2)}
            </tr>

            {/* Fila Impuestos.- Subsidios sobre la Producción */}
            <tr>
              {cellGeneratorForByActivities.generate(`tax.usage.total`)}
              <DisabledCell />
              {branchesIndexes.toReversed().map((idx) => {
                return cellGeneratorForByActivities.generate(
                  `tax.usage.branch${idx}`
                );
              })}
              <td>
                <strong>Impuestos.- Subsidios sobre la Producción</strong>
              </td>
              {DisabledCells(`usage_tax_`, 5, branches.length + 2)}
            </tr>

            {/* Fila Excedente de Explotación Bruto */}
            <tr>
              {cellGeneratorForByActivities.generate(`eeb.usage.total`)}
              {cellGeneratorForByActivities.generate(`eeb.usage.gov`)}
              {branchesIndexes.toReversed().map((idx) => {
                return cellGeneratorForByActivities.generate(
                  `eeb.usage.branch${idx}`
                );
              })}
              <td>
                <strong>Excedente de Explotación Bruto</strong>
              </td>
              {DisabledCells(`usage_eeb_`, 5, branches.length + 2)}
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
          currentItem={CuGeIByInstitutionalSectors}
          storageKey="cuGeIByInstitutionalSectors"
          saveModalTitle="Guardar Cuenta de Generación de Ingresos por Sectores Institucionales"
          loadModalTitle="Cargar Cuenta de Generación de Ingresos por Sectores Institucionales"
          deleteModalTitle="Borrar Cuenta de Generación de Ingresos por Sectores Institucionales"
          deleteModalMessage="¿Está seguro que desea borrar la Cuenta de Generación de Ingresos por Sectores Institucionales?"
          itemSaver={saveCuGeIByInstitutionalSectorsValues}
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
              {DisabledCells(`sbsxR.resource`, 0, 5)}
              <td>
                <strong>Saldo de bienes y servicios con el exterior</strong>
              </td>
              {DisabledCells(`sbsxR.resource`, 6, 3)}
              {cellGeneratorForByInstitutionalSectors.generate(
                "sbsxR.resource.rm"
              )}
              {cellGeneratorForByInstitutionalSectors.generate(
                "sbsxR.resource.total"
              )}
            </tr>
            <tr>
              {DisabledCells(`vab`, 0, 5)}
              <td>
                <strong>Valor Agregado Bruto</strong>
              </td>
              {cellGeneratorForByInstitutionalSectors.generate(
                "vab.resource.society"
              )}
              {cellGeneratorForByInstitutionalSectors.generate(
                "vab.resource.gov"
              )}
              {cellGeneratorForByInstitutionalSectors.generate(
                "vab.resource.st"
              )}
              <DisabledCell />
              {cellGeneratorForByInstitutionalSectors.generate(
                "vab.resource.total"
              )}
            </tr>
            <tr>
              {cellGeneratorForByInstitutionalSectors.generate(
                "ra.usage.total"
              )}
              <DisabledCell />
              {cellGeneratorForByInstitutionalSectors.generate("ra.usage.st")}
              {cellGeneratorForByInstitutionalSectors.generate("ra.usage.gov")}
              {cellGeneratorForByInstitutionalSectors.generate(
                "ra.usage.society"
              )}
              <td>
                <strong>Remuneración de Asalariados</strong>
              </td>
              {DisabledCells(`ra`, 6, 5)}
            </tr>
            <tr>
              {cellGeneratorForByInstitutionalSectors.generate(
                "tax.usage.total"
              )}
              <DisabledCell />
              {cellGeneratorForByInstitutionalSectors.generate("tax.usage.st")}
              <DisabledCell />
              {cellGeneratorForByInstitutionalSectors.generate(
                "tax.usage.society"
              )}
              <td>
                <strong>Impuestos.- Subsidios sobre la Producción</strong>
              </td>
              {DisabledCells(`ra`, 6, 5)}
            </tr>
            <tr>
              {cellGeneratorForByInstitutionalSectors.generate(
                "eeb.usage.total"
              )}
              <DisabledCell />
              {cellGeneratorForByInstitutionalSectors.generate("eeb.usage.st")}
              {cellGeneratorForByInstitutionalSectors.generate("eeb.usage.gov")}
              {cellGeneratorForByInstitutionalSectors.generate(
                "eeb.usage.society"
              )}
              <td>
                <strong>Excedente de Explotación Bruto</strong>
              </td>
              {DisabledCells(`eeb`, 6, 5)}
            </tr>
            <tr>
              {cellGeneratorForByInstitutionalSectors.generate(
                "sbsxU.usage.total"
              )}
              {cellGeneratorForByInstitutionalSectors.generate(
                "sbsxU.usage.rm"
              )}
              {DisabledCells(`sbsx`, 2, 3)}
              <td>
                <strong>Saldo de bienes y servicios con el exterior</strong>
              </td>
              {DisabledCells(`sbsx`, 6, 5)}
            </tr>
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default CuGeI;
