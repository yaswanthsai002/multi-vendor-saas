const CART_CHANNEL = 'perigee-cart';
let channel: BroadcastChannel | undefined;

export function broadcastCartChange() {
  if (typeof BroadcastChannel === 'undefined') return false;
  channel ??= new BroadcastChannel(CART_CHANNEL);
  channel.postMessage('changed');
  return true;
}
