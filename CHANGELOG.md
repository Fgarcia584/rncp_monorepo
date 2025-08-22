# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

<!-- This file is auto-generated. Do not edit manually. -->

## [3.0.0](https://github.com/Fgarcia584/rncp_monorepo/compare/v2.0.0...v3.0.0) (2025-08-22)

### Features

* add comprehensive OWASP Top 10 security analysis ([d2c80f6](https://github.com/Fgarcia584/rncp_monorepo/commit/d2c80f6ef69d5961b6fcdcc7c45d74306a324351))
* configure Railway for production deployment with nginx ([5d748bd](https://github.com/Fgarcia584/rncp_monorepo/commit/5d748bdafdbe4f62c4b750248fbc913ac0384c44))
* implement automated dependency management with Dependabot ([21260be](https://github.com/Fgarcia584/rncp_monorepo/commit/21260be49522d718c7ea63bc1a10542ca1580b73))
* implement secure authentication with httpOnly cookies ([7673946](https://github.com/Fgarcia584/rncp_monorepo/commit/767394611b84aa44651ae4944d2dc68c4e46bb06))
* **security:** implement comprehensive security enhancements and monitoring ([0a117f7](https://github.com/Fgarcia584/rncp_monorepo/commit/0a117f75c757a36141c90de310a27f5b4c8de80d))

### Bug Fixes

* improve copy-types.js for Railway deployment ([1b66179](https://github.com/Fgarcia584/rncp_monorepo/commit/1b66179fc39915c65a701a2d5f3b82c540da4d9a))
* improve fallback types creation with complete type definitions ([afcd68b](https://github.com/Fgarcia584/rncp_monorepo/commit/afcd68b64922fb0d8de8e40978adba65ff4ea82a))
* **railway:** removed unused variable ([68934b1](https://github.com/Fgarcia584/rncp_monorepo/commit/68934b150d8667a5c1097bbb793ca4f21817ab65))
* resolve TypeScript build errors for Railway deployment ([19844ff](https://github.com/Fgarcia584/rncp_monorepo/commit/19844ff4397bfc0cbb63fccef9ada76c3f7f8b4d))
* update API URL for Railway test environment ([1d3506c](https://github.com/Fgarcia584/rncp_monorepo/commit/1d3506c1220a89b44511e11cc4545ae7ebf17c7a))
* update types after copy-types script execution ([2d51b60](https://github.com/Fgarcia584/rncp_monorepo/commit/2d51b60d7fb641403df2945d8a303baea56626a8))
* use nixpacks with production start command instead of preview ([7d70ccc](https://github.com/Fgarcia584/rncp_monorepo/commit/7d70ccc324db6784e484edbb5a36f4655734a8fe))
* use npm instead of pnpm for Railway start command ([50e0773](https://github.com/Fgarcia584/rncp_monorepo/commit/50e077338e40bd563e79ea86aeeb640e0eec84e7))

### Reverts

* restore original working nixpacks configuration ([a5c09ca](https://github.com/Fgarcia584/rncp_monorepo/commit/a5c09cac35039986c1459a4cad5540e8b839e6b7))

### Documentation

* update integration documentation ([b5ab9d0](https://github.com/Fgarcia584/rncp_monorepo/commit/b5ab9d0fa8a541afdb8e5caf1cb56090cc704d26))

## [2.0.0](https://github.com/Fgarcia584/rncp_monorepo/compare/v1.0.0...v2.0.0) (2025-08-22)

### ⚠ BREAKING CHANGES

* **dashboard:** Developers must create local .env files from templates

### Features

* add automatic database initialization to Railway deployment ([6d5300e](https://github.com/Fgarcia584/rncp_monorepo/commit/6d5300e1466b07d9feb693c61590ce0864bf2489))
* add automatic database migrations on Railway deployment ([da8e8bd](https://github.com/Fgarcia584/rncp_monorepo/commit/da8e8bd2f50f5eec406745819ab7aa945ee8f7cd))
* add automatic role account creation to Railway deployment ([51860d1](https://github.com/Fgarcia584/rncp_monorepo/commit/51860d1660d2a8f0af7f1d71ccbecb828773c750))
* add automatic schema creation back to deployment ([be62595](https://github.com/Fgarcia584/rncp_monorepo/commit/be62595fa1500a3284756b8adb2a7f53ac5a2884))
* add coordinates support to order DTO and fix Docker path ([e7edd27](https://github.com/Fgarcia584/rncp_monorepo/commit/e7edd27ad5c3fd80b5161be114aeabd11116c722))
* add database initialization scripts with seed data ([2827118](https://github.com/Fgarcia584/rncp_monorepo/commit/2827118a620111ab2d7d105dfc62a513bb98bc79))
* add script to create essential user accounts for each role ([7c7fc02](https://github.com/Fgarcia584/rncp_monorepo/commit/7c7fc02da60c38d804da536c8eedbd646b4a9e7e))
* complete Sentry integration with comprehensive monitoring setup ([858b260](https://github.com/Fgarcia584/rncp_monorepo/commit/858b260f8c777da7a42cb1d1495395f697d84792))
* configure PostgreSQL variables for Railway deployment ([2ea271b](https://github.com/Fgarcia584/rncp_monorepo/commit/2ea271b5d55400236352cb0945fa26f77ecb0da3))
* **dashboard:** replace mock data with real API data and fix security issues ([d92f4a5](https://github.com/Fgarcia584/rncp_monorepo/commit/d92f4a5738123ee6b0673736665be0ae8957d3ef))
* Enhance PWA functionality and UI ([1c5a51a](https://github.com/Fgarcia584/rncp_monorepo/commit/1c5a51aa72d25ba4f9e3f839578d4b4b430250d8))
* implement automatic type copying and update TypeScript configuration for Railway deployment ([b008d71](https://github.com/Fgarcia584/rncp_monorepo/commit/b008d71d8a48a3d535a47d6a6df4e3f709938ee7))
* implement automatic type copying and update TypeScript configurations for improved Railway deployment ([e395669](https://github.com/Fgarcia584/rncp_monorepo/commit/e3956692596c32230e9e925d5fe2f3d8eab45c54))
* implement railway full deployment configuration and add health check endpoint ([d08e650](https://github.com/Fgarcia584/rncp_monorepo/commit/d08e6506ff30490c0be335c57e40dacd611980fd))
* Implement tracking API and geolocation services ([97edaf6](https://github.com/Fgarcia584/rncp_monorepo/commit/97edaf66de808de604cbdbef0bb9ae270a34d833))
* major improvements for map delivery system and Railway deployment ([926f7d5](https://github.com/Fgarcia584/rncp_monorepo/commit/926f7d5ae643d101f4175766f6407ad0a6885999))
* Refactor GitHub Actions workflows to comment out sections for future reference and maintainability. This includes build and push, deploy infrastructure, deploy production, and deploy test workflows. The changes aim to improve readability and facilitate potential reactivation of commented sections. ([761c225](https://github.com/Fgarcia584/rncp_monorepo/commit/761c2254ee7b338fc9d3b5e06768340e9a595c29))
* replace railway prebuild script with complete types copying for Railway deployment ([d6700f3](https://github.com/Fgarcia584/rncp_monorepo/commit/d6700f3f92f2d86aafed051ff55b006c4b6eee39))
* sync railway.toml with railway.json for auto-migrations ([a123cd9](https://github.com/Fgarcia584/rncp_monorepo/commit/a123cd9379c80e4c5bec7a7026096a48751e2bfb))

### Bug Fixes

* add connection debug logging to schema initialization script ([8ec8ff7](https://github.com/Fgarcia584/rncp_monorepo/commit/8ec8ff7f02aec5956177aaf9823f6b9703daae72))
* add missing TrackingService to Railway module providers ([68cf1dc](https://github.com/Fgarcia584/rncp_monorepo/commit/68cf1dcd46f878417a844a78f3c791a20d5170ea))
* add Railway preparation script to handle workspace dependencies ([3911025](https://github.com/Fgarcia584/rncp_monorepo/commit/39110254274246e84ccadbf209ea03e42da246d4))
* add TypeORM configuration to Railway module ([82ed5b5](https://github.com/Fgarcia584/rncp_monorepo/commit/82ed5b5340914a4fdd181f41c9fbdb708c7a0ab9))
* add TypeScript path mapping for @rncp/types in API ([d416448](https://github.com/Fgarcia584/rncp_monorepo/commit/d416448bc49f5051a243db69463c4b90847877bc))
* align Railway Dockerfile CMD with railway.json configuration ([ffc833c](https://github.com/Fgarcia584/rncp_monorepo/commit/ffc833ca2956b9d4b5b5298deb396e326b1eb204))
* allow all hosts in Vite preview for Railway production domains ([028696f](https://github.com/Fgarcia584/rncp_monorepo/commit/028696f3c51b823a48ca5f37ae5dc5dc4c99536b))
* allow Railway healthcheck host in Vite preview configuration ([f39c5b6](https://github.com/Fgarcia584/rncp_monorepo/commit/f39c5b677bedf33569280b2c7b6639d839e5ef18))
* **architecture:** code structure for improved readability and maintainability ([2ff3963](https://github.com/Fgarcia584/rncp_monorepo/commit/2ff3963a0dc8e9d5f1dc79956f8994268ab9dc8d))
* configure automatic table creation in Railway module ([3e64cd7](https://github.com/Fgarcia584/rncp_monorepo/commit/3e64cd7d4cf7894dd8283eb530580f39b654a495))
* configure VITE_API_URL at build time for Railway deployment ([1166c76](https://github.com/Fgarcia584/rncp_monorepo/commit/1166c76f8ea94dcfaac3bcff400b069d239fe2e8))
* correct API URL configuration for Railway deployment ([0f39265](https://github.com/Fgarcia584/rncp_monorepo/commit/0f39265e0ef020870ed3043d2bb4bfe683b66be1))
* correct CMD paths in Docker microservice files ([cedad78](https://github.com/Fgarcia584/rncp_monorepo/commit/cedad781c5e2643ac465c1bfaef38c2d2c66a51c))
* correct nginx.conf path in Docker build for Railway deployment ([8ce3921](https://github.com/Fgarcia584/rncp_monorepo/commit/8ce3921ba1c20b2d885057fa1ebcd13afc7df420))
* create Railway-compatible package.json for frontend without workspace dependencies ([e42e996](https://github.com/Fgarcia584/rncp_monorepo/commit/e42e99655e3774fd0ddfbfbd9c5fa7c5dfb5344e))
* disable PWA assets auto-generation for Railway deployment ([618d64a](https://github.com/Fgarcia584/rncp_monorepo/commit/618d64a8e639232f07ec4b31e71c51a197027c36))
* force nixpacks usage and resolve workspace protocol issues ([7b42aa4](https://github.com/Fgarcia584/rncp_monorepo/commit/7b42aa41ff2fbd51efd362b44d20acd85ae248a3))
* force Railway rebuild and add fallback for role creation ([4778320](https://github.com/Fgarcia584/rncp_monorepo/commit/4778320ee68fa83d480fead7a9ea4472631beaa2))
* force Railway rebuild to include new init-schema script ([adef0b3](https://github.com/Fgarcia584/rncp_monorepo/commit/adef0b3c61a494a379d22a4d3622840d3b18b4e7))
* force rebuild by updating init-schema script to ensure compilation ([2576664](https://github.com/Fgarcia584/rncp_monorepo/commit/2576664602fca876ddc53e3d73fb1b79e3883fcd))
* improve CORS configuration for Railway deployments ([0d60cec](https://github.com/Fgarcia584/rncp_monorepo/commit/0d60cec0fd15ae1bb70fb2fb905eb32b218feeb0))
* improve database connection handling for Railway ([65f675b](https://github.com/Fgarcia584/rncp_monorepo/commit/65f675beec249aa93e1a9c5858ceac6485eb9754))
* Jest configuration with ts-jest ([a1106cd](https://github.com/Fgarcia584/rncp_monorepo/commit/a1106cd8b43306e248e30b7a6cc987c8a6b77bf7))
* Railway deployment configuration ([dd3ad61](https://github.com/Fgarcia584/rncp_monorepo/commit/dd3ad613c6fc90ea7cedb6749f3cb6c9692747ff))
* remove all references to setSelectedPlace to fix Railway build ([1d1d582](https://github.com/Fgarcia584/rncp_monorepo/commit/1d1d5827062de046fad74e50aa4ada835453e9b8))
* remove migration run from startCommand for clean deployment ([483f028](https://github.com/Fgarcia584/rncp_monorepo/commit/483f0289d203d0a7ecdb210370bea36c28ddd1f6))
* remove missing PWADebugInfo import and fix ESLint errors ([3f72810](https://github.com/Fgarcia584/rncp_monorepo/commit/3f728103f9de721470f2a83d3c980548194511cf))
* resolve @rncp/types import issues for Railway deployment ([e497723](https://github.com/Fgarcia584/rncp_monorepo/commit/e497723510bc90e276b70176145f2b4fc5800702))
* resolve Corepack signature verification error ([5ea3d60](https://github.com/Fgarcia584/rncp_monorepo/commit/5ea3d607ebb8526f1a59063137b77bebf8a672f8))
* resolve failing tests and improve test reliability ([4a4a95d](https://github.com/Fgarcia584/rncp_monorepo/commit/4a4a95dfc4a4a49b77c6a8a60bb9dc25a07583a8))
* resolve final TypeScript compilation errors for Railway ([4a1b34c](https://github.com/Fgarcia584/rncp_monorepo/commit/4a1b34c4399d745f62ac021cc9b75f80c625d159))
* resolve Gateway race condition causing 400 errors on order acceptance ([cee9b19](https://github.com/Fgarcia584/rncp_monorepo/commit/cee9b1912eec72fcacdca24103fd93708374bafe))
* resolve import paths for @rncp/types to relative imports across the project ([4be75f1](https://github.com/Fgarcia584/rncp_monorepo/commit/4be75f18024a597f2ccbbcb0d7473c9a45a5d8f5))
* resolve import paths for @rncp/types to relative imports across the project ([ab92708](https://github.com/Fgarcia584/rncp_monorepo/commit/ab927087038f5bd2d4c2c6ebeae516cc6b71b27e))
* resolve NestJS dependency conflict for Railway deployment ([d854071](https://github.com/Fgarcia584/rncp_monorepo/commit/d854071c861922a93279149e287532e22c1ecc3d))
* resolve Railway deployment errors for both frontend and backend ([105fe6d](https://github.com/Fgarcia584/rncp_monorepo/commit/105fe6db6e9e703ff257bff19c3fe82bfc786ccd))
* resolve TypeScript and ESLint violations in Sentry integration ([bc7e091](https://github.com/Fgarcia584/rncp_monorepo/commit/bc7e091811a41d0f0dc252b951f24be2df13c8f5))
* resolve TypeScript build errors for Railway deployment ([a7933f1](https://github.com/Fgarcia584/rncp_monorepo/commit/a7933f1b6d48ab475125e6b6b9140aa397823381))
* resolve TypeScript compilation errors for Railway build ([2f88486](https://github.com/Fgarcia584/rncp_monorepo/commit/2f88486e77f2dca5608ec90814c310b872796064))
* resolve TypeScript compilation errors for Railway deployment ([73b6801](https://github.com/Fgarcia584/rncp_monorepo/commit/73b6801e34ef3eb8a24996b2f6327fc5a7dd5df7))
* resolve TypeScript errors in database initialization script ([6c5849a](https://github.com/Fgarcia584/rncp_monorepo/commit/6c5849abf3ca22dfdcef4c33ee0d620e06d7401e))
* resolve TypeScript errors in Sentry filter and interceptor ([7ea209f](https://github.com/Fgarcia584/rncp_monorepo/commit/7ea209fff36cc55b28f688bf3e4f3d037e1ecce6))
* resolve workspace protocol for Railway deployment ([0a9cda9](https://github.com/Fgarcia584/rncp_monorepo/commit/0a9cda9292ae47e92345642a035202fd34c9bc99))
* restore essential CI and release workflows ([dd5f057](https://github.com/Fgarcia584/rncp_monorepo/commit/dd5f057778c2767bcea2ad1214e728bd7a399586))
* **security:** remove sensitive env files from git tracking ([c90754c](https://github.com/Fgarcia584/rncp_monorepo/commit/c90754cb515db02e63dbc7276c80172a39d1e048))
* temporarily disable coordinate sending in order creation ([fdcf357](https://github.com/Fgarcia584/rncp_monorepo/commit/fdcf3575d70724a24a875ee265ff3f37cdebfb24))
* temporarily remove schema creation from startCommand until rebuild completes ([ae7b614](https://github.com/Fgarcia584/rncp_monorepo/commit/ae7b6145efbdc2555735197243d1ace5d4cefd35))
* use compiled JavaScript for TypeORM migrations in production ([6a3b3a1](https://github.com/Fgarcia584/rncp_monorepo/commit/6a3b3a1ae849bbbf55fe77342ab12ca4a8bcd93b))
* use migrations instead of schema script until rebuild completes ([12ab2ef](https://github.com/Fgarcia584/rncp_monorepo/commit/12ab2efa2ee2ef928f20625adfc611e53b8d37a1))
* use Railway-compatible package.json without workspace dependencies ([4222cf4](https://github.com/Fgarcia584/rncp_monorepo/commit/4222cf49d00048edc529593dd6be3683ceba7a10))

###  Refactoring

* clean up unused type files and improve type copying script to skip test files ([10a5b35](https://github.com/Fgarcia584/rncp_monorepo/commit/10a5b35dd6392055f4ea39c474e10eb497b40d79))
* clean up unused type files and improve type copying script to skip test files ([51f8035](https://github.com/Fgarcia584/rncp_monorepo/commit/51f8035ab372686b7f38f043be9f811bc82c1586))
* remove automatic database initialization from deployment ([08ae820](https://github.com/Fgarcia584/rncp_monorepo/commit/08ae8207d4db68b68c05997600f01fdc283cfe68))
* separate database schema creation and data seeding ([c0d2391](https://github.com/Fgarcia584/rncp_monorepo/commit/c0d2391f13b894ec029f223f2e50c3817ef23589))

### Documentation

* add database initialization command to railway.toml ([0ed7991](https://github.com/Fgarcia584/rncp_monorepo/commit/0ed799167d2343dfb046add37da69dcbc1992ffa))

## 1.0.0 (2025-08-20)

### Features

* add automated release notes and changelog generation ([be378dd](https://github.com/Fgarcia584/rncp_monorepo/commit/be378dde89fe3dfacb34d3e406e9184d42f9760d))
* add Logistics Technician Dashboard and Merchant Dashboard with mock data and UI components ([65dc90a](https://github.com/Fgarcia584/rncp_monorepo/commit/65dc90a47b93b314068e11a7df00fdad189a5003))
* add MSW setup and Vitest configuration for testing ([9e89ad7](https://github.com/Fgarcia584/rncp_monorepo/commit/9e89ad7e590c11343cbbc4fee588d1e723b871bf))
* **auth:** add error handling utility and improve login/register forms ([93efc18](https://github.com/Fgarcia584/rncp_monorepo/commit/93efc183fae4de50dad672e22f4df1cde3245a72))
* **auth:** add shared TypeScript types for RNCP monorepo ([9454edb](https://github.com/Fgarcia584/rncp_monorepo/commit/9454edb6d20b5668fff83ed1eb7ee8a3810f81b5))
* **build:** update build and test scripts for rncp_api and add types build command ([45b8550](https://github.com/Fgarcia584/rncp_monorepo/commit/45b8550c36144283f586fa625a5d0d83f0f925bd))
* **ci:** add Docker Buildx setup step in build-and-push workflow ([b063f34](https://github.com/Fgarcia584/rncp_monorepo/commit/b063f34223493303b4b2927c21292d286cecb85a))
* **CI:** added github workflow ([d957e1f](https://github.com/Fgarcia584/rncp_monorepo/commit/d957e1f55888052a19a71fabc716f6ef1444198c))
* **deploy-test:** add build arguments for API URL and update CORS settings ([c01b1e1](https://github.com/Fgarcia584/rncp_monorepo/commit/c01b1e138c8f0932aefcab58d25021168082c0df))
* **deployments:** add Azure infrastructure deployment workflow and update permissions in settings ([89b03b0](https://github.com/Fgarcia584/rncp_monorepo/commit/89b03b0f5b284ab4e02e8062a2e93631b9709b2c))
* **deployments:** add OS type specification for container deployments and include frontend deployment step ([8494c3f](https://github.com/Fgarcia584/rncp_monorepo/commit/8494c3f1b4cbad640d0c751a228f4dcf8bc98d00))
* **deployments:** add OS type specification for container deployments in test and production workflows ([a8b27cc](https://github.com/Fgarcia584/rncp_monorepo/commit/a8b27cc1b0c78f848886774587fc71ca5cbc84e0))
* **deployments:** implement Azure infrastructure and deployment workflows for test and production environments ([d94359b](https://github.com/Fgarcia584/rncp_monorepo/commit/d94359beeebc27409d3d7243abb3a578af429200))
* **docker:** add Docker configuration for RNCP PWA and API services ([e29f72d](https://github.com/Fgarcia584/rncp_monorepo/commit/e29f72d8b8f35277bdf11bcdd5e944214cbe9375))
* **init:** init project ([48d52e3](https://github.com/Fgarcia584/rncp_monorepo/commit/48d52e34b1036bff31061359569bb4d1162767d8))
* **order-service:** implement order management functionality including creation, retrieval, updating, and deletion of orders ([4c3cee7](https://github.com/Fgarcia584/rncp_monorepo/commit/4c3cee7cee1209af0418735ca5a21ae922874a4d))
* **tests:** re-added jest configuration for unit testing in rncp_api ([f381285](https://github.com/Fgarcia584/rncp_monorepo/commit/f38128583ae12210ab0e0d39ca0239c390021b8e))
* update imports to use path alias for order types and refactor API URL retrieval ([362887d](https://github.com/Fgarcia584/rncp_monorepo/commit/362887de9471f637167b96104b27d34854d004b8))

### Bug Fixes

* **build-and-push:** update metadata extraction to prepend 'latest-' to environment suffix ([eb8bf45](https://github.com/Fgarcia584/rncp_monorepo/commit/eb8bf45b5b4fff2e2302e7b340f08b52e3437889))
* **build-and-push:** update metadata extraction to use environment suffix for latest tag ([e63fbf3](https://github.com/Fgarcia584/rncp_monorepo/commit/e63fbf37a7a592f59b8d839c1e976abd1a6381e8))
* **ci:** enhance build-and-push workflow to handle pull requests and fallback for feature branches ([8e23d97](https://github.com/Fgarcia584/rncp_monorepo/commit/8e23d97dd810255130903567f9cd82cda64c6922))
* **ci:** ensure build types step is included ([2d00ee1](https://github.com/Fgarcia584/rncp_monorepo/commit/2d00ee140bbc4cf5ed60b9a1a799933afaac88df))
* **deploy-test:** prepend 'sha-' to image tags in deployment commands ([d48cd06](https://github.com/Fgarcia584/rncp_monorepo/commit/d48cd06d4fead0928edb1c6067451aa9877de566))
* **deploy-test:** remove 'sha-' prefix from image tags in deployment commands ([2e6e4ef](https://github.com/Fgarcia584/rncp_monorepo/commit/2e6e4ef279b83647f784c977557acd28a92f07eb))
* **deploy-test:** standardize quotes in API Gateway deployment command ([f77a382](https://github.com/Fgarcia584/rncp_monorepo/commit/f77a382d8173bef3cd7b24c352d8dc1cc4c9785f))
* **deploy-test:** standardize quotes in API Gateway deployment command ([51ce2ea](https://github.com/Fgarcia584/rncp_monorepo/commit/51ce2ea284913f1a345a2ee31715866c244de1a6))
* **deploy-test:** standardize string quotes and update deployment notification messages ([75c8edb](https://github.com/Fgarcia584/rncp_monorepo/commit/75c8edb42a1c337af421b329445d61d95ebfd01d))
* **deploy-test:** update health check URLs to use HTTP instead of HTTPS ([b2561fd](https://github.com/Fgarcia584/rncp_monorepo/commit/b2561fd02f69f453a2f56072eebe0cf80160610f))
* **deployments:** correct echo command for updating GitHub environment secrets ([b03b0ae](https://github.com/Fgarcia584/rncp_monorepo/commit/b03b0aed43d6da7e343dd818cfb792bf8ab23f76))
* **deployments:** correct environment variable references in GitHub secrets update step ([1355eaa](https://github.com/Fgarcia584/rncp_monorepo/commit/1355eaac2bdd9c7c6a634d5d146887d8c47aa746))
* **deployments:** correct syntax for setting CONNECTION_STRING in database connectivity test ([0589d1e](https://github.com/Fgarcia584/rncp_monorepo/commit/0589d1e0e7539ff7c82296b031d17b838a061095))
* **deployments:** update API URLs to use francecentral region for production and test environments ([3921352](https://github.com/Fgarcia584/rncp_monorepo/commit/3921352b56bb2712c207e4e8434e956e4d951ee4))
* **husky:** add lint-staged command to pre-commit hook ([dd95a6d](https://github.com/Fgarcia584/rncp_monorepo/commit/dd95a6dae494585e65d7db4609ef270424effc50))
* remove npm audit signatures step from release workflow ([f42c291](https://github.com/Fgarcia584/rncp_monorepo/commit/f42c291c1430e2524aa20199895c7f557c20b50e))
* remove pull_request trigger from release drafter workflow ([f8183ff](https://github.com/Fgarcia584/rncp_monorepo/commit/f8183ffb8a890249b30e82c2f7277c6d781553a5))
* **test:** fix TU ([86d8040](https://github.com/Fgarcia584/rncp_monorepo/commit/86d80403c50d04ffa25560374ffa2c097ff7fd1f))
* **tests:** enhance MerchantDashboard tests with better error handling and improve IntersectionObserver mock ([11768b6](https://github.com/Fgarcia584/rncp_monorepo/commit/11768b6f72e8b0d374ee21a52b1b78720b4f277c))
* **tests:** update OrderService tests for type casting and improve readability ([785db88](https://github.com/Fgarcia584/rncp_monorepo/commit/785db88b2be111e4e8780163d4ee1bf2c8ea9bb6))
* update branch name from 'main' to 'master' in release drafter configuration ([15f3161](https://github.com/Fgarcia584/rncp_monorepo/commit/15f316154f396184572b95f68d728d731800d1d7))
* update branch name from 'main' to 'master' in release workflow ([d7eb876](https://github.com/Fgarcia584/rncp_monorepo/commit/d7eb8769c5281cba16f5096b36472182c6dde408))
* update branch name from 'main' to 'master' in workflows ([943d777](https://github.com/Fgarcia584/rncp_monorepo/commit/943d77794c7a891e14702a8a974a2733ad0e9237))
* update branch name from 'master' to 'main' in workflows ([ac87430](https://github.com/Fgarcia584/rncp_monorepo/commit/ac87430387cade0e0ee9facf94e6f8613a1459e9))
* **workflows:** update branch references from 'main' to 'master' and change Azure location to 'francecentral' ([d7fe315](https://github.com/Fgarcia584/rncp_monorepo/commit/d7fe315cf2a42cc0eefcefcc9e195a25e13bd953))

###  Refactoring

* **CI:** simplify working directory paths in CI workflow ([aeaf121](https://github.com/Fgarcia584/rncp_monorepo/commit/aeaf1219e1ca98e63bba934ae13d3615882b2f84))
* **CI:** update GitHub Actions workflow to use pnpm action and streamline test commands ([6602552](https://github.com/Fgarcia584/rncp_monorepo/commit/6602552fc059418ade21d91708f32742ba25ed3a))
* **deployments:** remove infrastructure deployment steps from test and production workflows ([c92b878](https://github.com/Fgarcia584/rncp_monorepo/commit/c92b8786d392469e094e74ff9067f299607e6398))
* **deployments:** streamline deployment script by removing unnecessary line breaks and improving echo statements ([e5b707a](https://github.com/Fgarcia584/rncp_monorepo/commit/e5b707a89b29f4da9c2a90d1e10308fbb45bab40))
* **package.json:** remove jest configuration from rncp_api ([4d327db](https://github.com/Fgarcia584/rncp_monorepo/commit/4d327dba232ba8729f5c8859896dfb35918baf38))
