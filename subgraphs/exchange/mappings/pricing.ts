/* eslint-disable prefer-const */
import { BigDecimal, Address } from "@graphprotocol/graph-ts/index";
import { Pair, Token, Bundle } from "../generated/schema";
import { ZERO_BD, factoryContract, ADDRESS_ZERO, ONE_BD } from "./utils";

let WMATIC_ADDRESS = "0x0db676216A3cdF226dfD1215DA88B6eF87a0a5B2";
// let ZOLA_LAZERMOON_PAIR = "0x9fd38c0ba9b6c69545db1e265f17a4464b00062d"; // created block 589414
// let WMATIC_ZOLA_PAIR = "0x06C93A0D54dAf0Cd3148A651cEdE3dFa18444d00"; // created block 648115
 let MATIC_USDC_PAIR = "0x0560829c353efcda2f2f15be15753340b48d44a1";

export function getBnbPriceInUSD(): BigDecimal {

  // fetch eth prices for each stablecoin

 // let lazermoonPair = Pair.load(ZOLA_LAZERMOON_PAIR);
 // let zolaPair = Pair.load(ZOLA_WMATIC_PAIR);

  let usdcPair = Pair.load(MATIC_USDC_PAIR);
  if (usdcPair !== null) {
    return usdcPair.token1Price
  }
  else {
    return ZERO_BD
  }

 // let usdcPair = Pair.load(MATIC_USDC_PAIR) // usdt is token1
 // let zolaPair = Pair.load(WMATIC_ZOLA_PAIR)

  // let lazermoonPair = Pair.load(ZOLA_LAZERMOON_PAIR);
  // let zolaPair = Pair.load(ZOLA_WMATIC_PAIR);

  // all 3 have been created
//   if (zolaPair !== null && usdcPair !== null ) {
//     let totalLiquidityBNB = zolaPair.reserve0.plus(usdcPair.reserve1)
//     let zolaWeight = zolaPair.reserve0.div(totalLiquidityBNB)
//     let usdcWeight = usdcPair.reserve1.div(totalLiquidityBNB)   // let usdtWeight = usdtPair.reserve0.div(totalLiquidityETH)
//     return zolaPair.token1Price
//       .times(zolaWeight)
//       .plus(usdcPair.token0Price.times(usdcWeight))
// // .plus(usdtPair.token1Price.times(usdtWeight))
// // dai and USDC have been created
//   } else if (zolaPair !== null && usdcPair !== null) {
//     let totalLiquidityBNB = zolaPair.reserve0.plus(usdcPair.reserve1)
//     let zolaWeight = zolaPair.reserve0.div(totalLiquidityBNB)
//     let usdcWeight = usdcPair.reserve1.div(totalLiquidityBNB)
//     return zolaPair.token1Price.times(zolaWeight).plus(usdcPair.token0Price.times(usdcWeight))
//    // USDC is the only pair so far
//   } else if (usdcPair !== null) {
//     return usdcPair.token0Price
//   } else if (zolaPair !== null) {
//     return zolaPair.token0Price
//   } else {
//     return ZERO_BD
//    }
}


// token where amounts should contribute to tracked volume and liquidity
let WHITELIST: string[] = [
  "0x0db676216A3cdF226dfD1215DA88B6eF87a0a5B2", // WMATIC
  "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", // USDC
  "0x6f8a06447Ff6FcF75d803135a7de15CE88C1d4ec", // SHIB
  "0xC004e2318722EA2b15499D6375905d75Ee5390B8", // KOM
  "0x8a226293bC6f697A681B0b29f825c149655fEC2d", // ZOLA token
  '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619', // WETH
  '0x108FD4c11d4a2A9a61ED420Ad21A198A6db5E100', // ZOLAMO
  '0x831753dd7087cac61ab5644b308642cc1c33dc13', //QUICK
  '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270', //WMATIC
  '0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6', //WBTC
  '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063', // DAI
  '0xc2132d05d31c914a87c6611c10748aeb04b58e8f', // USDT
  '0x9719d867a500ef117cc201206b8ab51e794d3f82', //MAUSDC
  '0x104592a158490a9228070e0a8e5343b499e125d0', //FRAX
  '0x033d942a6b495c4071083f4cde1f17e986fe856c', //AGA
  '0xd6df932a45c0f255f85145f286ea0b292b21c90b', //AAVE
  '0xA1c57f48F0Deb89f569dFbE6E2B7f46D33606fD4', //MANA
  '0xfe4546fefe124f30788c4cc1bb9aa6907a7987f9', //cxETH
  '0xE6469Ba6D2fD6130788E0eA9C0a0515900563b59',  //UST
  '0x0000000000000000000000000000000000001010', // MATIC
  '0xc1CEE919D93DC545D0EA59234C11BE7A536E5108',  // LAZERMOON
  '0x6f8a06447Ff6FcF75d803135a7de15CE88C1d4ec'   // SHIB
];

// minimum liquidity for price to get tracked
let MINIMUM_LIQUIDITY_THRESHOLD_BNB = BigDecimal.fromString("0");

/**
 * Search through graph to find derived BNB per token.
 * @todo update to be derived BNB (add stablecoin estimates)
 **/
export function findBnbPerToken(token: Token): BigDecimal {
  if (token.id == WMATIC_ADDRESS) {
    return ONE_BD;
  }
  // loop through whitelist and check if paired with any
  for (let i = 0; i < WHITELIST.length; ++i) {
    let pairAddress = factoryContract.getPair(Address.fromString(token.id), Address.fromString(WHITELIST[i]));
    if (pairAddress.toHex() != ADDRESS_ZERO) {
      let pair = Pair.load(pairAddress.toHex());
      if (pair.token0 == token.id && pair.reserveBNB.gt(MINIMUM_LIQUIDITY_THRESHOLD_BNB)) {
        let token1 = Token.load(pair.token1);
        return pair.token1Price.times(token1.derivedBNB as BigDecimal); // return token1 per our token * BNB per token 1
      }
      if (pair.token1 == token.id && pair.reserveBNB.gt(MINIMUM_LIQUIDITY_THRESHOLD_BNB)) {
        let token0 = Token.load(pair.token0);
        return pair.token0Price.times(token0.derivedBNB as BigDecimal); // return token0 per our token * BNB per token 0
      }
    }
  }
  return ZERO_BD; // nothing was found return 0
}

/**
 * Accepts tokens and amounts, return tracked amount based on token whitelist
 * If one token on whitelist, return amount in that token converted to USD.
 * If both are, return average of two amounts
 * If neither is, return 0
 */
export function getTrackedVolumeUSD(
  bundle: Bundle,
  tokenAmount0: BigDecimal,
  token0: Token,
  tokenAmount1: BigDecimal,
  token1: Token
): BigDecimal {
  let price0 = token0.derivedBNB.times(bundle.bnbPrice);
  let price1 = token1.derivedBNB.times(bundle.bnbPrice);

  // both are whitelist tokens, take average of both amounts
  if (WHITELIST.includes(token0.id) && WHITELIST.includes(token1.id)) {
    return tokenAmount0.times(price0).plus(tokenAmount1.times(price1)).div(BigDecimal.fromString("2"));
  }

  // take full value of the whitelisted token amount
  if (WHITELIST.includes(token0.id) && !WHITELIST.includes(token1.id)) {
    return tokenAmount0.times(price0);
  }

  // take full value of the whitelisted token amount
  if (!WHITELIST.includes(token0.id) && WHITELIST.includes(token1.id)) {
    return tokenAmount1.times(price1);
  }

  // neither token is on white list, tracked volume is 0
  return ZERO_BD;
}

/**
 * Accepts tokens and amounts, return tracked amount based on token whitelist
 * If one token on whitelist, return amount in that token converted to USD * 2.
 * If both are, return sum of two amounts
 * If neither is, return 0
 */
export function getTrackedLiquidityUSD(
  bundle: Bundle,
  tokenAmount0: BigDecimal,
  token0: Token,
  tokenAmount1: BigDecimal,
  token1: Token
): BigDecimal {
  let price0 = token0.derivedBNB.times(bundle.bnbPrice);
  let price1 = token1.derivedBNB.times(bundle.bnbPrice);

  // both are whitelist tokens, take average of both amounts
  if (WHITELIST.includes(token0.id) && WHITELIST.includes(token1.id)) {
    return tokenAmount0.times(price0).plus(tokenAmount1.times(price1));
  }

  // take double value of the whitelisted token amount
  if (WHITELIST.includes(token0.id) && !WHITELIST.includes(token1.id)) {
    return tokenAmount0.times(price0).times(BigDecimal.fromString("2"));
  }

  // take double value of the whitelisted token amount
  if (!WHITELIST.includes(token0.id) && WHITELIST.includes(token1.id)) {
    return tokenAmount1.times(price1).times(BigDecimal.fromString("2"));
  }

  // neither token is on white list, tracked volume is 0
  return ZERO_BD;
}
