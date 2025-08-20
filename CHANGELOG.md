# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

<!-- This file is auto-generated. Do not edit manually. -->

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
