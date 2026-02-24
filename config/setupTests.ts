import fetchMock from "jest-fetch-mock";

global.fetch = fetchMock as any;
