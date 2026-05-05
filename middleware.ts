import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const USER = process.env.BASIC_AUTH_USER ?? 'guest';
  const PASS = process.env.BASIC_AUTH_PASS ?? '';

  const basicAuth = req.headers.get('authorization');

  if (basicAuth) {
    const authValue = basicAuth.split(' ')[1];
    const [user, pwd] = atob(authValue).split(':');

    if (user === USER && pwd === PASS) {
      // 認証成功：そのまま画面を表示
      return NextResponse.next();
    }
  }

  // 認証失敗・未認証：パスワード入力のポップアップを出す
  return new NextResponse('認証が必要です。', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Secure Area"',
    },
  });
}

// 適用する範囲（画像やNext.jsのシステムファイル以外、すべてのページに鍵をかける）
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|dokidoki-logo.png).*)'],
};