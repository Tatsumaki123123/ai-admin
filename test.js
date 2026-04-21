const response = await fetch('https://www.apecode.cc/api/usage', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer sk-RCFbgZrkjuFtDEgDlqo3HN8T0Ywz6B349ZgVp3E2bbARN9kN'
  }
});
const body = await response.text();
console.log(body);
