const path = require('path')
const resolve = (fileName) => path.resolve(__dirname, fileName)

module.exports = {
    resolve: {
        alias: {
            '@Src': resolve('../src'),
        },
    }
}