// type "reg" handler  
export function handleRegistration(ws, data, id) {
  // registration logic ???
  console.log('Received reg message:', data);

  const response = {
    type: 'reg',
    data: JSON.stringify({
      name: data.name,
      index: 1,
      error: false,
      errorText: '',
    }),
    id,
  };

  ws.send(JSON.stringify(response));
}