import {describe, expect, test} from 'vitest'
import {
  Coin,
  coinsToWei,
  coinsToWeiInBigInt,
  dangerouslyWeiToCoinsInFloat,
  format,
  weiToCoins, weiFormat
} from 'src/coin'

describe('Utils - coins', () => {
  test('coinsToWei', () => {
    expect(coinsToWei('1')).to.equal('1000000000000000000')
    expect(coinsToWei('0.000000000000000001')).to.equal('1')
    expect(coinsToWeiInBigInt('0.0000000000000001')).to.equal(100n)
    expect(coinsToWei('1000000000000000000')).to.equal('1000000000000000000000000000000000000')
    expect(coinsToWeiInBigInt('1000000000000000000')).to.equal(1000000000000000000000000000000000000n)

    expect(() => coinsToWei('-1')).to.throw()
    expect(() => coinsToWei('')).to.throw()
    expect(() => coinsToWei('abc')).to.throw()
  })

  test('coinsToWei - decimals', () => {
    expect(coinsToWei('1', 12)).to.equal('1000000000000')
    expect(coinsToWei('1.1', 12)).to.equal('1100000000000')
    expect(coinsToWeiInBigInt('1.123456789', 12)).to.equal(1123456789000n)
    expect(coinsToWeiInBigInt('0.0000000001', 12)).to.equal(100n)

    expect(() => coinsToWei('1', 'abc' as any)).to.throw('must be a number')
    expect(() => coinsToWei('1', -1)).to.throw('between 0 and 18')
    expect(() => coinsToWei('1', 0)).to.throw('between 0 and 18')
    expect(() => coinsToWei('1', 19)).to.throw('between 0 and 18')
  })

  test('weiToCoins', () => {
    expect(weiToCoins('1000000000000000000')).to.equal('1')
    expect(weiToCoins('100000000000000000')).to.equal('0.1')
    expect(weiToCoins('1100000000000000000')).to.equal('1.1')
  })

  test('weiToCoins - decimals', () => {
    expect(weiToCoins('1000000000000', 12)).to.equal('1')
    expect(weiToCoins('100000000000', 12)).to.equal('0.1')
    expect(weiToCoins('1100000000000', 12)).to.equal('1.1')

    expect(() => weiToCoins('1', 'abc' as any)).to.throw('must be a number')
    expect(() => weiToCoins('1', -1)).to.throw('between 0 and 18')
    expect(() => weiToCoins('1', 0)).to.throw('between 0 and 18')
    expect(() => weiToCoins('1', 19)).to.throw('between 0 and 18')
  })

  // not sure that this test will work and will work same in different environments
  test('dangerouslyWeiToCoinsInFloat', () => {
    expect(dangerouslyWeiToCoinsInFloat('1000000000000000000')).to.equal(1)
    expect(dangerouslyWeiToCoinsInFloat('100000000000000000')).to.equal(0.1)
    expect(dangerouslyWeiToCoinsInFloat('1100000000000000000')).to.equal(1.1)
    expect(dangerouslyWeiToCoinsInFloat('300000000000000000')).to.equal(0.3)
    expect(dangerouslyWeiToCoinsInFloat('10000000450000000000000000')).to.equal(10000000.45)
    expect(dangerouslyWeiToCoinsInFloat('000000000000000001')).to.equal(1e-18)
  })

  test('formatWithMetricSuffix', () => {
    expect(format('1532900')).to.equal('1.533M')
    expect(format('1000')).to.equal('1000')
    expect(format('987654321')).to.equal('987.654M')

    expect(format('1532900')).to.equal('1.533M')
    expect(format('1000')).to.equal('1000')
    expect(format('987654321')).to.equal('987.654M')
    expect(format('0')).to.equal('0')
  })

  test('weiToCoinsWithMetricSuffix', () => {
    expect(weiFormat('1532900000000000000000000')).to.equal('1.533M')
    expect(weiFormat('1199999000000000000000', 12)).to.equal('1.2B')
    expect(weiFormat('1199999000000000000000', )).to.equal('1199.99')
    expect(weiFormat('1199999000000000000000',  18, -1)).to.equal('1199.999')
    expect(weiFormat('1000000000000000',  12)).to.equal('1000')
    expect(weiFormat('1000000000000000', 6)).to.equal('1B')
    expect(weiFormat('1000000000000000', 3)).to.equal('1T')
    expect(weiFormat('1000000000000000', 1)).to.equal('100T')
  })

  test('Coin pseudo-class', () => {
    const eth = Coin('ETH')

    // basic methods
    expect(eth.coinsToWeiInBigInt('1')).to.equal(1000000000000000000n)
    expect(eth.coinsToWei('1')).to.equal('1000000000000000000')
    expect(eth.weiToCoins('1100000000000000000')).to.equal('1.1')
    expect(eth.dangerouslyWeiToCoinsInFloat('1100000000000000000')).to.equal(1.1)

    // currency and decimals specific methods
    // expect(eth.weiFormat('1199500000000000000000')).to.equal('1199.5 ETH')
    expect(eth.format('1199.9')).to.equal('1199.90 ETH')

    // with currency and decimals
    const coin12 = Coin('COIN12', 12)
    expect(coin12.format('1199.9')).to.equal('1199.90 COIN12')
    expect(coin12.format('1199999.9')).to.equal('1.2M COIN12')
    expect(coin12.weiFormat('1199400000000000000000')).to.equal('1.199B COIN12')
    expect(coin12.weiFormat('1199400000400000')).to.equal('1199.40 COIN12')
    expect(coin12.weiFormat('1199500000000000000000')).to.equal('1.2B COIN12')

    // empty currency, default decimals
    const empty = Coin('')
    expect(empty.formatPrecise('1199.9')).to.equal('1199.900')
    expect(empty.weiFormat('1199500000000000000000')).to.equal('1199.50')

    // without currency, specific decimals
    const empty12 = Coin('', 12)
    expect(empty12.format('1199.9')).to.equal('1199.90')
    expect(empty12.weiFormat('1199400000000000000000')).to.equal('1.199B')
    expect(empty12.weiFormat('1199500000000000')).to.equal('1199.50')
    expect(empty12.weiFormat('1199500000000000000000')).to.equal('1.2B')
  })

  test('all formats', () => {
    const eth = Coin('ETH')
    const empty = Coin('', 12)
    const btc = Coin('BTC', 8, 6, 100)

    console.log(eth.coinsToWei('1234.56')); // Outputs: "1234560000000000000000"
    console.log(eth.weiToCoins('1234567890123456789000')); // Outputs: "1234.567890123456789"
    console.log(eth.format('1234.56')); // Outputs: "1.235K ETH"
    console.log(btc.formatPrecise('1234.56')); // Outputs: "1234.560000 BTC"
    console.log(eth.weiFormat('1234567890123456789000')); // Outputs: "1234.567890 ETH"
    console.log(eth.weiFormat('1234567890123456789000000')); // Outputs: "1234.56 ETH"
    console.log(btc.weiFormatPrecise('123456789012')); // Outputs: "1234.567890 BTC"

    expect(eth.inAllFormats('1199.9')).to.deep.equal({
      parsed: '1199.9',
      exact: '1199.9 ETH',
      full: '1199.90 ETH',
      precise: '1199.900 ETH',
      wei: '1199900000000000000000',
      currency: 'ETH',
    })

    expect(eth.inAllFormats('0.01')).to.deep.equal({
      parsed: '0.01',
      exact: '0.01 ETH',
      full: '0.01 ETH',
      precise: '0.010 ETH',
      wei: '10000000000000000',
      currency: 'ETH',
    })

    expect(btc.weiInAllFormats('119950000000')).to.deep.equal({
      parsed: '1199.5',
      exact: '1199.5 BTC',
      full: '1.199K BTC',
      precise: '1199.500000 BTC',
      wei: '119950000000',
      currency: 'BTC',
    })

    expect(empty.weiInAllFormats('100000000')).to.deep.equal({
      parsed: '0.0001',
      exact: '0.0001',
      full: '0.0001',
      precise: '0.000',
      wei: '100000000',
      currency: '',
    })
  })
})
