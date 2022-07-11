/* eslint-disable prefer-const */
import { BigInt, log } from "@graphprotocol/graph-ts";
import { Factory } from "../generated/schema";
import { NewSmartChefContract } from "../generated/SmartChefFactory/SmartChefFactory";
import { BLACKLISTED_ADDRESSES, convertTokenToDecimal } from "./utils";
import { SmartChefInitializable } from "../generated/templates";
import { getOrCreateToken } from "./utils/erc20";
import {
  fetchEndBlock,
  fetchRewardPerBlock,
  fetchRewardToken,
  fetchStakeToken,
  fetchStartBlock,
  fetchUserLimit,
  getOrCreateSmartChef,
} from "./utils/smartchef";

let ZERO_BI = BigInt.fromI32(0);
let ONE_BI = BigInt.fromI32(1);
let FACTORY_ADDRESS = "0xB4cF380EAdcf29177b08058b6a9d84d4Ab38f00a";
let FACTORY_V2_ADDRESS = "0xB4cF380EAdcf29177b08058b6a9d84d4Ab38f00a";

export function handleNewSmartChefContract(event: NewSmartChefContract): void {
  // Do not process some SmartChef smart contract, hiccup.
  if (BLACKLISTED_ADDRESSES.includes(event.params.smartChef.toHex())) {
    return;
  }

  let factory = Factory.load(FACTORY_ADDRESS);
  if (factory === null) {
    factory = new Factory(FACTORY_ADDRESS);
    factory.totalSmartChef = ZERO_BI;
    factory.save();
  }
  factory.totalSmartChef = factory.totalSmartChef.plus(ONE_BI);
  factory.save();

  process(event);
}

export function handleNewSmartChefContractV2(event: NewSmartChefContract): void {
  let factory = Factory.load(FACTORY_V2_ADDRESS);
  if (factory === null) {
    factory = new Factory(FACTORY_V2_ADDRESS);
    factory.totalSmartChef = ZERO_BI;
    factory.save();
  }
  factory.totalSmartChef = factory.totalSmartChef.plus(ONE_BI);
  factory.save();

  process(event);
}

function process(event: NewSmartChefContract): void {
  let stakeTokenAddress = fetchStakeToken(event.params.smartChef);
  let stakeToken = getOrCreateToken(stakeTokenAddress);

  let earnTokenAddress = fetchRewardToken(event.params.smartChef);
  let earnToken = getOrCreateToken(earnTokenAddress);

  let smartChef = getOrCreateSmartChef(event.params.smartChef);
  smartChef.stakeToken = stakeToken.id;
  smartChef.earnToken = earnToken.id;
  smartChef.startBlock = fetchStartBlock(event.params.smartChef);
  smartChef.endBlock = fetchEndBlock(event.params.smartChef);
  smartChef.reward = convertTokenToDecimal(fetchRewardPerBlock(event.params.smartChef), earnToken.decimals);

  let userLimit = fetchUserLimit(event.params.smartChef);
  if (userLimit.gt(ZERO_BI)) {
    smartChef.limit = convertTokenToDecimal(userLimit, stakeToken.decimals);
  }

  smartChef.block = event.block.number;
  smartChef.timestamp = event.block.timestamp;
  smartChef.save();
  SmartChefInitializable.create(event.params.smartChef);
  log.info("SmartChef initialized: {}", [smartChef.id]);
}
