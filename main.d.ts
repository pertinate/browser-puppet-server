// <reference no-default-lib="true"/>
// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace NodeJS {
    interface ProcessEnv {
        NODE_ENV: 'dev' | 'prod' | 'stage';
    }
}
