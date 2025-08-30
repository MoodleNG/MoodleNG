export type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';
export type ParamLocation = 'query' | 'body';

export type EndpointDef<Params, M extends HttpMethod = 'get', S extends ParamLocation | undefined = undefined> = {
  method: M;
  sendIn?: S;
};

const getQ = <P>(): EndpointDef<P, 'get', 'query'> => ({ method: 'get', sendIn: 'query' });
const getB = <P>(): EndpointDef<P, 'get', 'body'> => ({ method: 'get', sendIn: 'body' });
const postB = <P>(): EndpointDef<P, 'post', 'body'> => ({ method: 'post', sendIn: 'body' });
const postQ = <P>(): EndpointDef<P, 'post', 'query'> => ({ method: 'post', sendIn: 'query' });

export const endpoints = {
  auth: getQ<{
    username: string;
    password: string;
  }>(),

  core_webservice_get_site_info: getQ<{
    wstoken: string;
  }>(),

} as const;

export type EndpointKey = keyof typeof endpoints;
export type EndpointParams<K extends EndpointKey> = (typeof endpoints)[K] extends EndpointDef<infer P, any, any> ? P : never;
export type EndpointMethod<K extends EndpointKey> = (typeof endpoints)[K] extends EndpointDef<any, infer M, any> ? M : never;
export type EndpointSendIn<K extends EndpointKey> = (typeof endpoints)[K] extends EndpointDef<any, any, infer S> ? S : undefined;
