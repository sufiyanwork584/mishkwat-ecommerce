import fs from 'fs';

async function run() {
  const res = await fetch('http://localhost:5000/api/v1/categories');
  const data = await res.json();
  fs.writeFileSync('categories_out.json', JSON.stringify(data, null, 2));
  
  const res2 = await fetch('http://localhost:5000/api/v1/products?category=6a40fbbe136a2f790c55d0c4');
  const data2 = await res2.json();
  fs.writeFileSync('products_out.json', JSON.stringify(data2, null, 2));
}
run();
