import {describe, expect, test} from 'vitest'
import {
  Coin,
  coinToWei,
  coinToWeiInBigInt,
  dangerouslyWeiToCoinInFloat,
  formatNice,
  weiToCoin, weiFormatNice, gweiToWei, cleanUpCoinsValue
} from './src/coin'

describe('Utils - coins', () => {
  test('coinToWei', () => {
    expect(coinToWei('1')).to.equal('1000000000000000000')
    expect(coinToWei('0.000000000000000001')).to.equal('1')
    expect(coinToWeiInBigInt('0.0000000000000001')).to.equal(100n)
    expect(coinToWei('1000000000000000000')).to.equal('1000000000000000000000000000000000000')
    expect(coinToWeiInBigInt('1000000000000000000')).to.equal(1000000000000000000000000000000000000n)

    expect(() => coinToWei('-1')).to.throw()
    expect(() => coinToWei('')).to.throw()
    expect(() => coinToWei('abc')).to.throw()
  })

  test('coinToWei - decimals', () => {
    expect(coinToWei('1', 12)).to.equal('1000000000000')
    expect(coinToWei('1.1', 12)).to.equal('1100000000000')
    expect(coinToWeiInBigInt('1.123456789', 12)).to.equal(1123456789000n)
    expect(coinToWeiInBigInt('0.0000000001', 12)).to.equal(100n)

    expect(() => coinToWei('1', 'abc' as any)).to.throw('must be a number')
    expect(() => coinToWei('1', -1)).to.throw('between 0 and 18')
    expect(() => coinToWei('1', 0)).to.throw('between 0 and 18')
    expect(() => coinToWei('1', 19)).to.throw('between 0 and 18')
  })

  test('weiToCoin', () => {
    expect(weiToCoin('1000000000000000000')).to.equal('1')
    expect(weiToCoin('100000000000000000')).to.equal('0.1')
    expect(weiToCoin('1100000000000000000')).to.equal('1.1')
  })

  test('weiToCoin - decimals', () => {
    expect(weiToCoin('1000000000000', 12)).to.equal('1')
    expect(weiToCoin('100000000000', 12)).to.equal('0.1')
    expect(weiToCoin('1100000000000', 12)).to.equal('1.1')

    expect(() => weiToCoin('1', 'abc' as any)).to.throw('must be a number')
    expect(() => weiToCoin('1', -1)).to.throw('between 0 and 18')
    expect(() => weiToCoin('1', 0)).to.throw('between 0 and 18')
    expect(() => weiToCoin('1', 19)).to.throw('between 0 and 18')
  })

  // not sure that this test will work and will work same in different environments
  test('dangerouslyWeiToCoinInFloat', () => {
    expect(dangerouslyWeiToCoinInFloat('1000000000000000000')).to.equal(1)
    expect(dangerouslyWeiToCoinInFloat('100000000000000000')).to.equal(0.1)
    expect(dangerouslyWeiToCoinInFloat('1100000000000000000')).to.equal(1.1)
    expect(dangerouslyWeiToCoinInFloat('300000000000000000')).to.equal(0.3)
    expect(dangerouslyWeiToCoinInFloat('10000000450000000000000000')).to.equal(10000000.45)
    expect(dangerouslyWeiToCoinInFloat('000000000000000001')).to.equal(1e-18)
  })

  test('formatWithMetricSuffix', () => {
    expect(formatNice('1532900')).to.equal('1.532M')
    expect(formatNice('1000')).to.equal('1000')
    expect(formatNice('987654321')).to.equal('987.654M')

    expect(formatNice('1532900')).to.equal('1.532M')
    expect(formatNice('1000')).to.equal('1000')
    expect(formatNice('987654321')).to.equal('987.654M')
    expect(formatNice('0')).to.equal('0')
  })

  test('weiToCoinWithMetricSuffix', () => {
    expect(weiFormatNice('1532900000000000000000000')).to.equal('1.532M')
    expect(weiFormatNice('1199999000000000000000', 12)).to.equal('1.199B')
    expect(weiFormatNice('1199999000000000000000',)).to.equal('1199.99')
    expect(weiFormatNice('1199999000000000000000', 18, -1)).to.equal('1199.999')
    expect(weiFormatNice('1000000000000000', 12)).to.equal('1000')
    expect(weiFormatNice('1000000000000000', 6)).to.equal('1B')
    expect(weiFormatNice('1000000000000000', 3)).to.equal('1T')
    expect(weiFormatNice('1000000000000000', 1)).to.equal('100T')
  })

  test('Coin pseudo-class', () => {
    const eth = Coin('ETH')

    // basic methods
    expect(eth.coinToWeiInBigInt('1')).to.equal(1000000000000000000n)
    expect(eth.coinToWei('1')).to.equal('1000000000000000000')
    expect(eth.weiToCoin('1100000000000000000')).to.equal('1.1')
    expect(eth.dangerouslyWeiToCoinInFloat('1100000000000000000')).to.equal(1.1)

    // currency and decimals specific methods
    // expect(eth.weiFormatNice('1199500000000000000000')).to.equal('1199.5 ETH')
    expect(eth.formatNice('1199.9')).to.equal('1199.90 ETH')

    // with currency and decimals
    const coin12 = Coin('COIN12', 12)
    expect(coin12.formatNice('1199.9')).to.equal('1199.90 COIN12')
    expect(coin12.formatNice('1199999.9')).to.equal('1.199M COIN12')
    expect(coin12.weiFormatNice('1199400000000000000000')).to.equal('1.199B COIN12')
    expect(coin12.weiFormatNice('1199400000400000')).to.equal('1199.40 COIN12')
    expect(coin12.weiFormatNice('1199500000000000000000')).to.equal('1.199B COIN12')

    // empty currency, default decimals
    const empty = Coin('')
    expect(empty.formatFixed('1199.9')).to.equal('1199.900')
    expect(empty.weiFormatNice('1199500000000000000000')).to.equal('1199.50')

    // without currency, specific decimals
    const empty12 = Coin('', 12)
    expect(empty12.formatNice('1199.9')).to.equal('1199.90')
    expect(empty12.weiFormatNice('1199400000000000000000')).to.equal('1.199B')
    expect(empty12.weiFormatNice('1199500000000000')).to.equal('1199.50')
    expect(empty12.weiFormatNice('1199500000000000000000')).to.equal('1.199B')

    //test decimals passing
    const btc = Coin('BTC', 8, 6, 100)
    expect(btc.coinToWei('0.00015')).to.equal('15000')
    expect(btc.weiToCoin('24000')).to.equal('0.00024')
    expect(btc.weiFormatNice('123456789012')).to.equal('1.234K BTC')
    expect(btc.weiFormatMetric('123456789012')).to.equal('1.234K')
    expect(btc.weiFormatFixed('123456789012')).to.equal('1234.567890 BTC')
    expect(btc.weiFormatFixedClean('123456789012')).to.equal('1234.567890')
  })

  test('all formats', () => {
    const eth = Coin('ETH')
    const empty = Coin('', 12)
    const btc = Coin('BTC', 8, 6, 100)

    expect(cleanUpCoinsValue(1234567.890)).to.equal('1234567.89')
    expect(cleanUpCoinsValue('         \n1234567.890 ')).to.equal('1234567.89')

    expect(eth.formatNice('1234999.9999')).to.equal('1.234M ETH')

    expect(eth.inAllFormats('1234567.890')).to.deep.equal({
        value: '1234567.89',
        exact: '1234567.89 ETH',
        nice: '1.234M ETH',
        metric: '1.234M',
        fixed: '1234567.890 ETH',
        wei: '1234567890000000000000000',
        currency: 'ETH',
      }
    )

    expect(eth.weiInAllFormats(1n)).to.deep.equal({
      value: '0.000000000000000001',
      exact: '0.000000000000000001 ETH',
      metric: '0',
      nice: '0 ETH',
      fixed: '0.000 ETH',
      wei: '1',
      currency: 'ETH',
    })

    expect(eth.weiInAllFormats(1_000_000_000n)).to.deep.equal({
      value: '0.000000001',
      exact: '0.000000001 ETH',
      metric: '0',
      nice: '0 ETH',
      fixed: '0.000 ETH',
      wei: '1000000000',
      currency: 'ETH',
    })

    expect(eth.weiInAllFormats(1_000_000_000_000n)).to.deep.equal({
      value: '0.000001',
      exact: '0.000001 ETH',
      metric: '0.000001',
      nice: '0.000001 ETH',
      fixed: '0.000 ETH',
      wei: '1000000000000',
      currency: 'ETH',
    })

    expect(eth.inAllFormats('1199.99999')).to.deep.equal({
      value: '1199.99999',
      exact: '1199.99999 ETH',
      metric: '1199.99',
      nice: '1199.99 ETH',
      fixed: '1199.999 ETH',
      wei: '1199999990000000000000',
      currency: 'ETH',
    })

    expect(eth.inAllFormats('1234999.9999')).to.deep.equal({
      value: '1234999.9999',
      exact: '1234999.9999 ETH',
      metric: '1.234M',
      nice: '1.234M ETH',
      fixed: '1234999.999 ETH',
      wei: '1234999999900000000000000',
      currency: 'ETH',
    })


    expect(eth.inAllFormats('11990000000000000.91212123')).to.deep.equal({
      value: '11990000000000000.91212123',
      exact: '11990000000000000.91212123 ETH',
      metric: '11990T',
      nice: '11990T ETH',
      fixed: '11990000000000000.912 ETH',
      wei: '11990000000000000912121230000000000',
      currency: 'ETH',
    })

    expect(eth.inAllFormats('0.01')).to.deep.equal({
      value: '0.01',
      exact: '0.01 ETH',
      metric: '0.01',
      nice: '0.01 ETH',
      fixed: '0.010 ETH',
      wei: '10000000000000000',
      currency: 'ETH',
    })

    expect(btc.weiInAllFormats('119950000000')).to.deep.equal({
      value: '1199.5',
      exact: '1199.5 BTC',
      metric: '1.199K',
      nice: '1.199K BTC',
      fixed: '1199.500000 BTC',
      wei: '119950000000',
      currency: 'BTC',
    })

    expect(empty.weiInAllFormats('100000000')).to.deep.equal({
      value: '0.0001',
      exact: '0.0001',
      metric: '0.0001',
      nice: '0.0001',
      fixed: '0.000',
      wei: '100000000',
      currency: '',
    })
  })

  test('gwei conversion', () => {
    const eth = Coin('ETH')
    const btc = Coin('BTC', 8, 6, 100)

    expect(eth.gwei.gweiToWei(1000)).to.equal('1000000000000')
    expect(eth.gwei.gweiToWei(1)).to.equal('1000000000')
    expect(() => eth.gwei.gweiToWei(-1)).to.throw()

    expect(eth.gwei.weiToGwei(1_000_123_000_000n)).to.equal('1000.123')
    expect(eth.gwei.weiToGwei(1_000_000_000n)).to.equal('1')
    expect(() => eth.gwei.weiToGwei(-1n)).to.throw()

    expect(eth.gwei.gweiToWei(1000000.567)).to.equal('1000000567000000')
    expect(eth.gwei.weiToGwei('1000000567000000')).to.equal('1000000.567')
    expect(eth.gwei.gweiToCoin(1000000.567)).to.equal('0.001000000567')
    expect(eth.gwei.coinToGwei('0.001000000567')).to.equal('1000000.567')

    // yes, gwei is quite not applicable for BTC, but it's just a test
    expect(btc.gwei.gweiToWei(1000)).to.equal('10000000')
    expect(btc.gwei.gweiToWei(1)).to.equal('10000')
    expect(btc.gwei.gweiToWei(10000)).to.equal('100000000')
    expect(btc.weiToCoin(btc.gwei.gweiToWei(10000))).to.equal('1')
    expect(btc.gwei.gweiToWei(btc.gwei.coinToGwei(1))).to.equal(btc.coinToWei('1'))
  })
})
