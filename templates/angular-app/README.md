# frontend-template

Standalone Angular 21 and Angular Material 21 frontend with responsive navigation,
adjustable brightness, Cognito sign-in and registration, account profile flows,
and a technology dashboard. The signed-in toolbar uses the bundled, seamless
`public/images/green-pixels.jpg` background without stretching. The footer
displays the account API's health, polling `/actuator/health` every 30 seconds.
The dashboard cards explain the roles of the included technologies and are
grouped into Front-end, Back-end, Cloud, and Tools tabs, also reachable from the side menu.
The baseline Material 3 palette is generated from `#0CE161`; the application
generator replaces the name and generates a new palette from the requested color.

Card logos are served locally from `public/logos`: most come from
[Devicon](https://github.com/devicons/devicon) (MIT; see
`public/logos/DEVICON-LICENSE.txt`), the Amplify and Cognito icons from
[theSVG](https://github.com/GLINCKER/thesvg) (see
`public/logos/THESVG-LICENSE.txt`), and the Neon mark from
[Simple Icons](https://github.com/simple-icons/simple-icons). Spring Boot,
Spring Security, Spring Data JPA, Spring Boot Actuator, and Spring Boot DevTools share the
Spring logo; Angular-family cards reuse the Angular and Angular Material logos, and SQL
migrations reuses the PostgreSQL logo. Logos remain
trademarks of their owners; their appearance identifies technologies, not
an endorsement.

## Local setup

Requirements: Node.js and npm.

```bash
npm ci
npm start
```

Open `http://localhost:4200/`. The local `/api/account`, `/actuator/health`,
`/swagger-ui`, and `/v3/api-docs` proxies target `http://localhost:8080` in `proxy.conf.json`.
The toolbar's ⋮ menu links to the backend's Swagger UI and opens an About dialog.
A compatible backend must be
running on port 8080; changing the proxy port is not a substitute for starting it.
No backend is bundled or provisioned.

## Brightness

The toolbar shows a sun for the light profile or a moon for the dark profile.
Click the brightness icon in the signed-in toolbar to show or hide the horizontal
slider to its left, with an accessible label and no visible text. Opening it
does not change the theme. Slide right for
light surfaces (100%) and left for dark surfaces (0%).
Backgrounds move through neutral grays from `#121212` (dark) to `#FAFAFA` (light),
without a primary-color tint. Surface text uses black or white, whichever provides greater
contrast. Primary buttons, icons, borders, and highlights steadily darken from
tone 80 on the darkest background to tone 40 on the lightest background.
Primary accents can have reduced contrast against backgrounds near the middle
of the slider. Filled primary
controls use contrasting black or white text.
The level is saved locally and restored on reload; existing
light/dark preferences remain supported.
Keyboard users can adjust the slider with arrow keys, Home, and End.

## Authentication and account configuration

Populate `app/auth/auth.config.ts` with an approved Cognito user-pool ID,
public app-client ID, managed-login domain, and exact sign-in/sign-out redirect
URLs. Use authorization-code OAuth with PKCE and a public client without a client
secret. Obtain approval before reusing another application's resources or
changing AWS resources or registered callback URLs.

Until configured, the app displays an authentication setup notice. Build and
unit test success do not verify live authentication or account integration;
verify those flows in a browser after configuring the services.

The backend must validate Cognito ID tokens and support authenticated
`GET /api/account` and `PUT /api/account` requests with an
`Authorization: Bearer <ID token>` header. Account details contain `email`,
`firstName`, `lastName`, and `phoneNumber`. Updates contain required `firstName`
and `lastName` and nullable `phoneNumber`; email comes from the verified token.
The backend returns 404 for a missing account, 401 for invalid authentication,
and 409 for conflicting account identity.

The health endpoint must be publicly readable to the app without an access
token. The development proxy does not apply to production builds. Production hosting
must provide a same-origin HTTPS proxy for `/api/account`, `/actuator/health`,
`/swagger-ui`, and `/v3/api-docs` to the approved backend.
Keep credentials on the backend, never in the browser app, and do not expose
unauthenticated legacy backend endpoints to untrusted clients.

## Build and tests

```bash
npm run build
npm test
```

Build output is written to `dist/`. Unit tests use the Angular CLI and Vitest.
The template's existing initial bundle can exceed the 500 kB warning budget;
the error limit is 1 MB.
