# Web application for calculations of SUT (Supply and Use Table) and National Accounts / Aplicación web para calculos de COU (Cuadro de Oferta y Utilización) y Cuentas Nacionales.

## [Demo](https://hrkns.github.io/sut-and-sna/)

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

## Setup

This project uses Node `24.x` and Yarn Classic. A fresh checkout should run:

- `corepack enable`
- `corepack prepare yarn@1.22.15 --activate`
- `yarn install --frozen-lockfile`
- `yarn validate`

## Testing

This repository now includes three testing levels:

- Unit tests (isolated helpers in `src/shared`)
- Integration tests (React modules and user flows)
- End-to-end tests (browser-level flows with Playwright)

Commands:

- `yarn lint`
- `yarn format:check`
- `yarn test:coverage`
- `yarn test:unit`
- `yarn test:integration`
- `yarn test:e2e:install`
- `yarn test:e2e`
- `yarn build`
- `yarn validate`

Coverage policy:

- Full Jest coverage is collected from `src/shared/**/*.js`, `src/components/**/*.js`, and `src/App.js`.
- Shared helper coverage stays at `100%` for statements, branches, lines, and functions.
- Components and `App.js` use ratcheted thresholds so business-heavy UI code is reported without immediately requiring global `100%`.
