import admin from 'firebase-admin';
import env from 'dotenv';

env.config();

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID || "doc-fb03c",
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL || "firebase-adminsdk-fbsvc@doc-fb03c.iam.gserviceaccount.com",
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') || "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQC1RTq+d5UJghfU\nHRqSt/q0RAotlzyrXpJnQLltHF9QTURlyncyMRWKna6R2vFmfRy7B+hnmdmDO1Og\nVUAnRL9b7nwsoN7mC2w8OD79Tl68ljLx7kcShL4Fw1sfy+MU2LrDckJ6pBnwzn2F\nVDKpFmA0yv6denNwgkp4hPc6cR6p/dALaYz0GTM8YeGPlzSeGDUH1fUsiOcXZzTm\nluSM68sJg4rTa8xduLkgMty3TXC0yufJCyR2+Xl5Au4Sh375A3VJDZAT+I1zrA8d\nS5dgoT4wsO+ytxqP8cMsbnbJEaOyXAX3QUiCfvyghEgJrHWyzAiZHxrn5xDDZxMp\nM3c7yydhAgMBAAECggEAAtVsuCqFZWsntTSpRC7lF+lSYWkSVTl6v2t3GpoNcWNr\n1M2H9Hxo8kxJvNT33hrJlrDmdKwmhtMoGQMMKDD+btD5FveC1ITMMdrNPUd62qbc\ncATCDquNjuiBZatZxusmbES+fk1PbIDF3I425obHhTvBJDQUVudqg5zMgpjfGlgr\nHcyM/JSPExTiEAVp4jdHoDhFtkMwClRTceSgRkolGWVR5W6Y1wmvFChrshJt96fb\nfFyqnGbAVGc7VRmwiGGN8ssE+diMrjvfKDT7ugZsqPnuUDKaKQPkqFaUmoAaEDBX\npNsH1xDCOyU1rc3nFLykbx+KwcvwWgLERLP77cuRSwKBgQDzdfBsCk4Cym+al/Vz\nC+TjKgr3qwqbIv/gzsaMXIEuRL+swwgnGo2bRD7MafKrp4YaN8wqp0JWnc+prgcd\nYuPXr9nW15fSIXxt/OXdq2fiqJaji1R51RcHJLUJStbuIVbYypfCmvP5kAEsZaLR\nCGSDuyG5oL9bRPCf8/HcpEbUowKBgQC+m020DwOfexPZi3DNyGIWJUiSLK9ScoAf\ncGC7aWikIT18LICQPSpWfv+4ONVTNgrrv291e+ptp/W9ACuDrVchknafqDGfg4Yd\nS9dPwe4ZFsKklBpy2ROJ3y9Cfm2LI7jhaXa/uipcK4OG1b41b2CaykFgcZXePJcd\nQe/cXWvQKwKBgBGALdsmVns+4Azl1YACn95wfD9XbTi/qFMZqg4W7DZOPNUHZAOj\nlgBORJFfIFGUhkBGOIfsZAlj6LSSzPIg1K4BdxBJiSFSxOYHIuLvWlVhtwpkjpr/\nZVtfGSBk39RYUyzcS1Jy3wzWfC8b0zthdhA+GGuGkZrW9tEYsQ8iQ/EvAoGATLDu\nLdGQsp1x2ikZxSKoHKL5tR7XmAPL+1pbAW0jFk7tj0XUoLSLkWvd9kCfzLBE6qAG\n961ZIK/g1x/3Yi7fjPmCUzD4bmccEjOOuV+dLmkS/ec9URJ4oxOyzz1RVBeWbtPh\nXLlKC/XSIPFla9iZdQ6GCYkKNPYKE1KRcQgBtisCgYApJkIHROGFQQ5QAmGDQfFH\n0daUpcGasqAfbUvNlnnGmTua0oPJ/2GUw0PyX8Nc2xgrACSm5o67EkVTM8bD8f2t\n+LyGqOp9EowAIILgYblJYxUvRPjlTzjerYyFlrpPilZGNqLdaqSSYiq5S6h3s/qR\neqhk6M/bJSvl3RTbBApkuw==\n-----END PRIVATE KEY-----\n",
        }),
    });
}

export default admin