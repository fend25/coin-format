# Coin Format

A tiny library for handling and formatting cryptocurrency values in JavaScript and TypeScript.
Zero dependencies. 1.2 Kb minified and compressed. Compatible with both browsers and Node, though it does necessitate support for BigInt (Node 12+, browsers 2020+).

[![npm version](https://badge.fury.io/js/coin-format.svg)](https://badge.fury.io/js/coin-format)
[![License: ISC](https://img.shields.io/badge/License-ISC-yellow.svg)](https://opensource.org/licenses/ISC)

## Introduction

The `coin-format` library is designed to simplify the handling and formatting of cryptocurrency values in various formats. It provides a versatile pseudoclass, `Coin`, for managing currency values with support for converting between "coins" and "wei" (the smallest denomination), formatting numbers, and rendering them in human-readable forms.

## Installation

To use `coin-format` in your project, add it to your dependencies:

```
npm install coin-format
```

## Usage

First, import the `Coin` pseudoclass from the library:

```
import { Coin } from 'coin-format'
```

Create an instance of `Coin` by specifying the currency code, decimal places, precision, and formatting threshold:

```
const eth = Coin('ETH') // Defaults to Ethereum settings
const btc = Coin('BTC', 8, 6, 100) // Custom Bitcoin settings, where
// 8 - satoshi decimals 
// 6 - precision (number of decimal places to consider in *Precise methods) 
// 100 - formatting threshold (number more than 100 will be formatted with metric suffixes)
```

### Formatting Values

`Coin` instances offer several methods for formatting and converting currency values:

- `coinsToWei` and `coinsToWeiInBigInt`: Convert coin values to wei.
- `weiToCoins`: Convert wei values to coin values.
- `format` and `formatPrecise`: Format coin values with or without specified precision.
- `weiFormat` and `weiFormatPrecise`: Format wei values in the coin format.

### Example

Convert a value in Ethereum and Bitcoin:

```
import { Coin } from 'coin-format'

eth.coinsToWei('1234.56') // Outputs: "1234560000000000000000"
eth.weiToCoins('1234567890123456789000') // Outputs: "1234.567890123456789"
```

### Formatters

#### Simple Formatters

```
import { Coin } from 'coin-format'

eth.format('1234.56') // Outputs: "1.235K ETH"
btc.formatPrecise('1234.56') // Outputs: "1234.560000 BTC"
eth.weiFormat('1234567890123456789000') // Outputs: "1234.567890 ETH"
eth.weiFormat('1234567890123456789000000') // Outputs: "1234.56 ETH"
btc.weiFormatPrecise('123456789012') // Outputs: "1234.567890 BTC"
```

#### Advanced Formatters

`inAllFormats` and `weiInAllFormats` methods provide a detailed breakdown of the formatted value in various formats:

```
const eth = Coin('ETH')
const btc = Coin('BTC', 8, 6, 100)
```


`eth.inAllFormats('1199.9')` will output:

```
{
  parsed: '1199.9',
  exact: '1199.9 ETH',
  full: '1199.90 ETH',
  precise: '1199.900 ETH',
  wei: '1199900000000000000000',
  currency: 'ETH',
}
```

`btc.weiInAllFormats('119950000000')` will output:

```
{
  parsed: '1199.5',
  exact: '1199.5 BTC',
  full: '1.199K BTC',
  precise: '1199.500000 BTC',
  wei: '119950000000',
  currency: 'BTC',
}
```

## Notes

- Ensure to handle large numbers as strings or `bigint` to avoid precision issues common with floating-point arithmetic in JavaScript.
- The `dangerouslyWeiToCoinsInFloat` method should be used sparingly due to the inherent risk of losing precision when dealing with rounding in JS.

## Contributing

Contributions to `coin-format` are welcome! Please submit pull requests or issues on GitHub to improve the library.

## License

`coin-format` is released under the ISC License.
