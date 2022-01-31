const fs = require('fs');
const http = require('http');
const url = require('url');
const slugify = require('slugify');
const replaceTemplate = require('./modules/replaceTemplate');
/**********************************************************************FILES***********************************************************************/

// Synchronous i.e blocking way
const textIn = fs.readFileSync('./txt/input.txt', 'utf-8');
console.log(textIn);

const textOutput = `This is what we know about the avocado: ${textIn}.\nCreated on ${Date.now()}`;
fs.writeFileSync('./txt/output.txt', textOutput);
console.log('File created!')

// Asynchronous non blocking way
fs.readFile('./txt/start.txt', 'utf-8', (err, data1) => {
    if (err) return console.log('Error!');
    fs.readFile(`./txt/${data1}.txt`, 'utf-8', (err, data2) => {
        console.log(data2);
        fs.readFile(`./txt/append.txt`, 'utf-8', (err, data3) => {
            console.log(data3);
            fs.writeFile(`./txt/final.txt`, `${data2}${data3}`, 'utf-8', (err) => {
                console.log('new file created')
            })
        })
    })
})

console.log('Wu hu');

/**********************************************************************WEBSERVER***********************************************************************/

let tempOverview = fs.readFileSync(`${__dirname}/templates/template-overview.html`, 'utf-8');
let tempCard = fs.readFileSync(`${__dirname}/templates/template-card.html`, 'utf-8');
let tempProduct = fs.readFileSync(`${__dirname}/templates/template-product.html`, 'utf-8');
let productData = fs.readFileSync(`${__dirname}/dev-data/data.json`, 'utf-8');
let productArr = JSON.parse(productData);

const slugs = productArr.map(cur => slugify(cur.productName, {lower: true}));
console.log('slugified is ', slugs);

const server = http.createServer((req, res) => {
    console.log('request url is ', req.url);
    console.log('parsed url is ', url.parse(req.url, true))

    const {query, pathname} = url.parse(req.url, true);
    console.log('query id is ', query.id, ' and its type is ', typeof query);

    // Overview page
    if (pathname === '/' || pathname === '/overview') {
        const cardsHtml = productArr.map(cur => replaceTemplate(tempCard, cur)).join('');
        tempOverview = tempOverview.replace(/{%PRODUCT_CARDS%}/, cardsHtml);

        res.writeHead(200, {
            'Content-type': 'text/html'
        })
        res.end(tempOverview)

        // Product page
    } else if (pathname === '/product') {
        let product;
        if (query.id <= 4) {
            product = productArr[query.id];
        } else {
            product = productArr[0];
        }
        const prodTemp = replaceTemplate(tempProduct, product);
        res.writeHead(200, {
            'Content-type': 'text/html'
        })
        res.end(prodTemp);

        // Api
    } else if (pathname === '/api') {
        res.writeHead(200, {
            'Content-type': 'application/json'
        })
        res.end(productData);

        // Not found
    } else {
        res.writeHead(404, {
            'Content-type': 'text/html',
            'Custom-header': 'Hello world'
        });
        res.end('<h1>Page not found!</h1>');
    }
});
server.listen(8000, '127.0.0.1', () => {
    console.log('Listening on port 8000')
});




























































