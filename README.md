# Web application for calculations of SUT (Supply and Use Table) and National Accounts / Aplicación web para calculos de COU (Cuadro de Oferta y Utilización) y Cuentas Nacionales.

## [Demo](https://hrkns.github.io/cou/)

## Modules:

- **Supply and Use Table (SUT) / Cuadro de Oferta y Utilización (COU)**
  ![Supply and Use Table (SUT) / Cuadro de Oferta y Utilización (COU)](docs/img/cou.png)

- **Production Account (By Activities and By Institutional Sectors) / Cuenta de Producción por Actividades (Por Actividades y Por Sectores Institucionales).**
  ![Production Account (By Activities and By Institutional Sectors) / Cuenta de Producción por Actividades (Por Actividades y Por Sectores Institucionales)](docs/img/CuPro.png)

- **Income Generation Account (By Activities and By Institutional Sectors) / Cuenta de Generación de Ingresos (Por Actividades y Por Sectores Institucionales).**
  ![Income Generation Account (By Activities and By Institutional Sectors) / Cuenta de Generación de Ingresos (Por Actividades y Por Sectores Institucionales)](docs/img/CuGI.png)

- **Income Assignment and Distribution Account (By Institutional Sectors) / Cuenta de Asignación y Distribución del Ingreso (Por Sectores Institucionales).**
  ![Income Assignment and Distribution Account (By Institutional Sectors) / Cuenta de Asignación y Distribución del Ingreso (Por Sectores Institucionales).](docs/img/CuADI.png)

- **Income Usage Account (By Institutional Sectors) / Cuenta de Utilización del Ingreso (Por Sectores Institucionales).**
  ![Income Usage Account (By Institutional Sectors) / Cuenta de Utilización del Ingreso (Por Sectores Institucionales).](docs/img/CUI.png)

- **Capital Account (By Institutional Sectors) / Cuenta Capital (Por Sectores Institucionales)**
  ![Capital Account (By Institutional Sectors) / Cuenta Capital (Por Sectores Institucionales)](docs/img/CuCa.png)

- **Financial Account (By Institutional Sectors) / Cuenta Financiera (Por Sectores Institucionales)**
  ![Financial Account (By Institutional Sectors) / Cuenta Financiera (Por Sectores Institucionales)](docs/img/CuFi.png)

## Other docs:

- [React](docs/react.md)

## Testing

This repository now includes three testing levels:

- Unit tests (isolated helpers in `src/shared`)
- Integration tests (React modules and user flows)
- End-to-end tests (browser-level flows with Playwright)

Commands:

- `yarn test:unit`
- `yarn test:integration`
- `yarn test:e2e:install`
- `yarn test:e2e`
- `yarn test:ci`
