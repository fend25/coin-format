# Coin Format

<img width="256" height="256" src="https://raw.githubusercontent.com/fend25/coin-format/main/logo.svg" alt="Coin Format library logo"/>

[//]: # (![Coin Format logo]&#40;https://raw.githubusercontent.com/fend25/coin-format/main/logo.svg)

A tiny library for handling and formatting cryptocurrency values in JavaScript and TypeScript. Truly, a concise and self-explanatory Swiss Army knife for coin value conversion and formatting.
Zero dependencies. 1.2 Kb minified and compressed. Compatible with both browsers and Node, though it does necessitate support for BigInt (Node 12+, browsers 2020+).

[![npm version](https://badge.fury.io/js/coin-format.svg)](https://badge.fury.io/js/coin-format)
[![License: ISC](https://img.shields.io/badge/License-ISC-yellow.svg)](https://opensource.org/licenses/ISC)

```typescript
coinToWei('1.2') // "1200000000000000000"
coinToWei('1.2', 8) // "120000000" - for btc or other coins with different decimals
weiToCoin('50000000000000000') // "0.05"

const eth = Coin('ETH')
eth.coinToWei('1.5') // "1500000000000000000"
eth.weiToCoin('1500000000000000000') // "1.5"

eth.formatNice('1234567.56') // "1.234M ETH"
eth.formatFixed('0.0010002') // "0.001 ETH"

eth.weiFormatNice('1234567890123456789000000') // "1.234M ETH"
eth.weiFormatFixed('1234567890123456789000') // "1234.567 ETH"

eth.inAllFormats('1234567.89')
// {
//   value: '1234567.89',
//   exact: '1234567.89 ETH',
//   nice: '1.234M ETH',
//   metric: '1.234M',
//   fixed: '1234567.890 ETH',
//   wei: '1234567890000000000000000',
//   currency: 'ETH',
// }
eth.weiInAllFormats('1234567890000000000000000') // same output

eth.gwei.gweiToWei('1') // "1000000000"
eth.gwei.weiToGwei('5678000000') // "5.678"
eth.gwei.gweiToCoin('1234000000') // "1.234"
eth.gwei.coinToGwei('1.234') // "1234000000"
```

And much more! Please continue reading below for a comprehensive guide to all the features and functionalities the library offers.

## Usage

The `coin-format` library is designed to simplify the handling and formatting of cryptocurrency values in various formats. It provides a versatile pseudoclass, `Coin`, for managing currency values with support for converting between "coins" and "wei" (the smallest denomination), formatting numbers, and rendering them in human-readable forms.

Installation: 

```
npm install coin-format
```

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
// 100 - formatting threshold (number more than 100 will be formatted with metric suffixes - K, M, B, T, etc.)
```

Default threshold is 100000 (100K), so values like "1234.56" and "99999.99" will be formatted as is, but "100000" will be formatted as "100K". If set the threshold to 1000, then "1234.56" will be formatted as "1.234K".

**IMPORTANT**: 
> **All formatters always do truncation (flooring), not rounding.** 
> 
> So, "1234.5678" will be formatted as "1234.567", not "1234.568". 
> 
> And "1234999.99" will be formatted as "1.234M", not "1.235M".
> 
> It's done to avoid confusion with the actual value, because it's used for money and overestimation is not acceptable.

### Formatting Values

`Coin` instances offer several methods for formatting and converting currency values:

- `coinToWei` and `coinToWeiInBigInt`: Convert coin values to wei.
- `weiToCoin`: Convert wei values to coin values.
- `formatNice` and `formatFixed`: Format coin values with or without specified precision.
- `weiFormatNice` and `weiFormatFixed`: Format wei values in the coin formatNice.

### Example

Convert a value in Ethereum and Bitcoin:

```
import { Coin } from 'coin-format'

eth.coinToWei('1234.56') // Outputs: "1234560000000000000000"
eth.weiToCoin('1234567890123456789000') // Outputs: "1234.567890123456789"
```

### Formatters

#### Simple Formatters

```
import { Coin } from 'coin-format'
const eth = Coin('ETH')
const btc = Coin('BTC', 8, 6, 100)

eth.formatNice('1234.56') // Outputs: "1234.56 ETH"
eth.formatMetric('1234.56') // Outputs: "1234.56"

btc.formatFixed('1234.56') // Outputs: "1234.560000 BTC"
btc.formatFixedClean('1234.56') // Outputs: "1234.560000"

eth.weiFormatNice('1234567890123456789000') // Outputs: "1234.567890 ETH"
eth.weiFormatMetric('1234567890123456789000') // Outputs: "1234.567890"
btc.weiFormatMetric('1234567890123') // Outputs: "1234.567890"

btc.weiFormatFixed('123456789012') // Outputs: "1234.567890 BTC"
btc.weiFormatFixedClean('123456789012') // Outputs: "1234.567890"
```

#### Advanced Formatters

`inAllFormats` and `weiInAllFormats` methods provide a detailed breakdown of the formatted value in various formats:

```
const eth = Coin('ETH')
const btc = Coin('BTC', 8, 6, 100) // starting with 100, `nice` property will try to fold the value with metric suffixes (K, M, B, T, etc.)
```

`eth.inAllFormats('1199.99999000')` will output:

```
{
  value: '1199.99999',
  exact: '1199.99999 ETH',
  nice: '1199.99 ETH',
  metric: '1199.99',
  fixed: '1199.999 ETH',
  wei: '1199999990000000000000',
  currency: 'ETH',
}
```

`eth.inAllFormats('1234567.8999')` will output:

```
{
  value: '1234567.8999',
  exact: '1234567.8999 ETH',
  nice: '1.234M ETH',
  metric: '1.234M',
  fixed: '1234567.899 ETH',
  wei: '1234567899900000000000000',
  currency: 'ETH',
}

```

`btc.weiInAllFormats('119950000000')` will output:

```
{
  value: '1199.5',
  exact: '1199.5 BTC',
  nice: '1.199K BTC',
  metric: '1.199K',
  fixed: '1199.500000 BTC',
  wei: '119950000000',
  currency: 'BTC',
}
```

#### Gwei conversion


The `Coin` pseudoclass includes a `gwei` object that provides utility methods for converting between Gwei, Wei, and coin denominations. This feature is essential for Ethereum and other blockchain technologies that use these units for transactions and gas calculations. It depends on the decimal value, effectively halving it to determine the Gwei multiplier (10^9 for 18 decimals).

##### Methods

- `gweiToWei(value: string | number | bigint): string` - Converts Gwei to Wei.
- `weiToGwei(value: string | bigint): string` - Converts Wei to Gwei.
- `gweiToCoin(value: string | number): string` - Converts Gwei to the main coin denomination.
- `coinToGwei(value: string | number): string` - Converts the main coin denomination to Gwei.

##### Usage Examples

```typescript
const eth = Coin('ETH')

eth.gwei.gweiToWei('1') // outputs: "1000000000" (wei)
eth.gwei.weiToGwei('5678000000') // outputs: "5.678" (gwei)
eth.gwei.gweiToCoin('1234000000') // outputs: "1.234" (eth)
eth.gwei.coinToGwei('1.234') // outputs: "1234000000" (gwei)
```

## Examples

#### Wei-Coin conversion

```typescript
import { Coin, weiToCoin, coinToWei } from 'coin-format'

coinToWei('1.2') // outputs: "1200000000000000000"
coinToWei('1.2', 8) // outputs: "120000000"
weiToCoin('500000000000000000') // outputs: "0.5"
weiToCoin('150000000', 8) // outputs: "1.5"

// All underlying operations are performed using strings,
// ensuring precise conversions without rounding or loss of precision.
weiToCoin(1n) // outputs: "0.000000000000000001"
// Therefore, avoid using the `dangerouslyWeiToCoinInFloat` method unless you understand the risks,
// including unpredictable value rounding and discrepancies from the actual value.
```

Of course, Coin contains the same methods and even more

```typescript
const eth = Coin('ETH')
eth.coinToWei('1.5') // outputs: "1500000000000000000"
eth.weiToCoin('1500000000000000000') // outputs: "1.5"
eth.weiToCoin(1n) // outputs: "0.000000000000000001"

const btc = Coin('BTC', 8)
btc.coinToWei('0.00015') // outputs: "15000" (satoshis)
btc.weiToCoin('24000') // outputs: "0.00024"
```

#### Formatting

```typescript
const eth = Coin('ETH') // Defaults settings - decimals: 18, precision: 6, threshold: 100000

// regular values
eth.formatNice('1199.9999') // outputs: "1199.99 ETH"
eth.formatFixed('1199.9999') // outputs: "1199.999 ETH"
eth.weiFormatNice('1199999900000000000000') // outputs: "1199.99 ETH"

// big values
eth.formatNice('1234567.9999') // outputs: "1.234M ETH"
eth.formatFixed('1234567.9999') // outputs: "1234567.999 ETH"
eth.weiFormatNice('1234567999900000000000000') // outputs: "1.234M ETH"

// small values
eth.formatNice('0.000001') // outputs: "0.000001 ETH"
eth.formatNice('0.0000001') // outputs: "0 ETH"
eth.formatFixed('0.0001') // outputs: "0.000 ETH"
eth.weiFormatNice('10000000000000000') // outputs: "0.01 ETH"
eth.weiFormatFixed('10000000000000000') // outputs: "0.010 ETH"
eth.weiFormatFixed('10', 17) // outputs: "0.00000000000000001 ETH"

// in all formats
eth.inAllFormats('1234567.9999')


eth.inAllFormats('1234567.999')
// {
//   value: '1234567.9999', 
//   nice: '1.234M ETH',
//   metric: '1.234M',
//   fixed: '1234567.999 ETH',
//   exact: '1234567.9999 ETH',
//   currency: 'ETH',
//   wei: '1234567999900000000000000'
// }

eth.weiInAllFormats('123456700000000000')
// {
//   value: '0.1234567',
//   nice: '0.1234 ETH',
//   metric: '0.1234',
//   fixed: '0.123 ETH',
//   exact: '0.1234567 ETH',
//   currency: 'ETH',
//   wei: '123456700000000000'
// }
```

##### Formatting without currency suffix
  
```typescript
const btc = Coin('BTC', 8, 6, 100)

btc.formatNice('1234.567890') // Outputs: "1.234K BTC"
btc.formatMetric('1234.567890') // Outputs: "1.234K"
btc.formatFixed('1234.567890') // Outputs: "1234.567890 BTC"
btc.formatFixedClean('1234.567890') // Outputs: "1234.567890"

btc.weiFormatNice('123456789012') // Outputs: "1.234K BTC"
btc.weiFormatMetric('123456789012') // Outputs: "1.234K"
btc.weiFormatFixed('123456789012') // Outputs: "1234.567890 BTC"
btc.weiFormatFixedClean('123456789012') // Outputs: "1234.567890"
```

#### Gwei conversion

```typescript
const eth = Coin('ETH')

eth.gwei.gweiToWei('1') // outputs: "1000000000" (wei)
eth.gwei.weiToGwei('5678000000') // outputs: "5.678" (gwei)
eth.gwei.gweiToCoin('1234000000') // outputs: "1.234" (eth)
eth.gwei.coinToGwei('1.234') // outputs: "1234000000" (gwei)
```




## Notes

- The 'Nice' and 'Fixed' formatters always perform truncation (flooring), not rounding. This approach is used to avoid confusion with the actual value, as overestimation is not acceptable in financial contexts.
- Ensure to handle large numbers as strings or `bigint` to avoid precision issues common with floating-point arithmetic in JavaScript.
- The `dangerouslyWeiToCoinInFloat` method should be used sparingly due to the inherent risk of losing precision when dealing with rounding in JS.

## Contributing

Contributions to `coin-format` are welcome! Please submit pull requests or issues on GitHub to improve the library.

## License

`coin-format` is released under the ISC License.
