export function maturityNotificationCopy(product: string, days: number) {
  return {
    title: `${product} 만기가 ${days}일 남았어요`,
    body: '눌러서 만기 자금을 확인해보세요.',
  };
}

export async function sendDemoNotification(message: string): Promise<'shown' | 'denied' | 'unsupported'> {
  if (!window.isSecureContext || !('Notification' in window) || !('serviceWorker' in navigator)) {
    return 'unsupported';
  }

  const permission = Notification.permission === 'default'
    ? await Notification.requestPermission()
    : Notification.permission;
  if (permission !== 'granted') return 'denied';

  const scope = import.meta.env.BASE_URL;
  await navigator.serviceWorker.register(`${scope}won-notifications.js`, { scope });
  const registration = await navigator.serviceWorker.ready;
  await registration.showNotification('WON하는 만기 · 시연', {
    body: message,
    tag: 'won-maturity-demo',
  });
  return 'shown';
}
