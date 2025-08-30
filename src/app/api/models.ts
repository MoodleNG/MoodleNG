import { HttpInterceptorFn, HttpParams } from '@angular/common/http';

export type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';
export type ParamLocation = 'query' | 'body';

export type EndpointDef<Params, M extends HttpMethod = 'get', S extends ParamLocation | undefined = undefined> = {
  method: M;
  sendIn?: S;
};

const getQ = <P>(): EndpointDef<P, 'get', 'query'> => ({ method: 'get', sendIn: 'query' });

export const endpoints = {
  auth: getQ<{
    username: string;
    password: string;
  }>(),

  core_webservice_get_site_info: getQ<{}>(),

} as const;

export type EndpointKey = keyof typeof endpoints;
export type EndpointParams<K extends EndpointKey> = (typeof endpoints)[K] extends EndpointDef<infer P, any, any> ? P : never;
export type EndpointMethod<K extends EndpointKey> = (typeof endpoints)[K] extends EndpointDef<any, infer M, any> ? M : never;
export type EndpointSendIn<K extends EndpointKey> = (typeof endpoints)[K] extends EndpointDef<any, any, infer S> ? S : undefined;

export const authInterceptorFn: HttpInterceptorFn = (req, next) => {
  let token: string | undefined;
  try {
    const saved = localStorage.getItem('api:auth');
    token = saved ? (JSON.parse(saved)?.token as string | undefined) : undefined;
  } catch {}

  if (!token || req.url.endsWith('/auth')) return next(req);
  const params = (req.params ?? new HttpParams()).set('wstoken', token);
  return next(req.clone({ params }));
};
