import "cdktf/lib/testing/adapters/jest";
import { TerraformStack, Testing } from "cdktf";
import {
  vpc,
  provider,
  subnet,
  internetGateway,
  routeTable,
} from "@cdktf/provider-aws";
import { Tagged, VpcStack } from "../main";

const NOW = "2023. 3. 31. 오전 11:43:10";
const slots = [
  new Tagged({ CreatedBy: "cdktf", Project: "cdktf-for-vpc" }, NOW),
  new Tagged({ how: "it", Project: "cdktf-for-vpc" }, NOW),
];

describe("Vpc stack", () => {
  it("should contain the follow resources", () => {
    const app = Testing.app();
    const stack = new VpcStack(app, "test", slots);
    const synthesized = Testing.synth(stack);

    expect(synthesized).toHaveProviderWithProperties(
      provider.AwsProvider,
      {
        region: "ap-northeast-2",
      }
    );
    expect(synthesized).toHaveResource(vpc.Vpc);
    expect(synthesized).toHaveResource(subnet.Subnet);
    expect(synthesized).toHaveResource(
      internetGateway.InternetGateway
    );
    expect(synthesized).toHaveResource(routeTable.RouteTable);
  });

  it("compare snapshots", () => {
    const app = Testing.app();
    const stack = new VpcStack(app, "test", slots);

    expect(Testing.synth(stack)).toMatchSnapshot();
  });

  it("to be valid terraform stack", () => {
    const app = Testing.app();
    const stack = new TerraformStack(app, "test");

    new VpcStack(stack, "test-app", slots);

    expect(Testing.fullSynth(stack)).toBeValidTerraform();
  });

  it("to be planned", () => {
    const app = Testing.app();
    const stack = new TerraformStack(app, "test");

    new VpcStack(stack, "test-app", slots);

    expect(Testing.fullSynth(stack)).toPlanSuccessfully();
  });
});
