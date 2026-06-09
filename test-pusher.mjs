import Pusher from 'pusher';

const pusher = new Pusher({
  appId: "2164758",
  key: "e2b815df86ed71acf449",
  secret: "2b2b9656a95262b02cfa",
  cluster: "us3",
  useTLS: true,
});

async function test() {
  console.log('Sending test event...');
  try {
    await pusher.trigger('test-channel', 'test-event', { message: 'hello world' });
    console.log('Success!');
  } catch (err) {
    console.error('Pusher error:', err);
  }
}

test();
