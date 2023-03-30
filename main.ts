import { Construct, IConstruct } from "constructs";
import { App, TerraformStack, Aspects, IAspect } from "cdktf";
import {
  vpc,
  provider,
  subnet,
  internetGateway,
  routeTable,
  route,
  routeTableAssociation,
} from "@cdktf/provider-aws";

const NOW = new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" });

type TaggableConstruct = IConstruct & {
  tags?: { [key: string]: string };
  tagsInput?: { [key: string]: string };
};

function isTaggableConstruct(x: IConstruct): x is TaggableConstruct {
  return "tags" in x && "tagsInput" in x;
}

class Tagged implements IAspect {
  constructor(private tags: Record<string, string>) {}

  visit(node: IConstruct): void {
    if (isTaggableConstruct(node)) {
      const currentTags = node.tagsInput || {};
      node.tags = {
        Name: node.node.id,
        CreatedAt: NOW,
        ...this.tags,
        ...currentTags,
      };
    }
  }
}

class VpcStack extends TerraformStack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    new provider.AwsProvider(this, `${id}-aws-provider`, {
      region: "ap-northeast-2",
    });

    const newVpc = new vpc.Vpc(this, `${id}-vpc`, {
      cidrBlock: "10.0.0.0/16",
    });

    const newInternetGateway = new internetGateway.InternetGateway(
      this,
      `${id}-internet-gateway`,
      {
        vpcId: newVpc.id,
      }
    );

    const publicSubnetA = new subnet.Subnet(this, `${id}-public-subnet-a`, {
      vpcId: newVpc.id,
      availabilityZone: "ap-northeast-2a",
      mapPublicIpOnLaunch: true,
      cidrBlock: "10.0.1.0/24",
    });

    const publicSubnetC = new subnet.Subnet(this, `${id}-public-subnet-c`, {
      vpcId: newVpc.id,
      availabilityZone: "ap-northeast-2c",
      mapPublicIpOnLaunch: true,
      cidrBlock: "10.0.3.0/24",
    });

    const publicRouteTable = new routeTable.RouteTable(
      this,
      `${id}-public-route-table`,
      {
        vpcId: newVpc.id,
      }
    );

    new routeTableAssociation.RouteTableAssociation(
      this,
      `${id}-route-table-association-public-subnet-a`,
      {
        routeTableId: publicRouteTable.id,
        subnetId: publicSubnetA.id,
      }
    );

    new routeTableAssociation.RouteTableAssociation(
      this,
      `${id}-route-table-association-public-subnet-c`,
      {
        routeTableId: publicRouteTable.id,
        subnetId: publicSubnetC.id,
      }
    );

    new route.Route(this, `${id}-route-public-to-internet-gateway`, {
      destinationCidrBlock: "0.0.0.0/0",
      routeTableId: publicRouteTable.id,
      gatewayId: newInternetGateway.id,
    });

    const privateSubnetA = new subnet.Subnet(this, `${id}-private-subnet-a`, {
      vpcId: newVpc.id,
      availabilityZone: "ap-northeast-2a",
      cidrBlock: "10.0.101.0/24",
    });

    const privateSubnetC = new subnet.Subnet(this, `${id}-private-subnet-c`, {
      vpcId: newVpc.id,
      availabilityZone: "ap-northeast-2c",
      cidrBlock: "10.0.103.0/24",
    });

    const privateRouteTable = new routeTable.RouteTable(
      this,
      `${id}-private-route-table`,
      {
        vpcId: newVpc.id,
      }
    );

    new routeTableAssociation.RouteTableAssociation(
      this,
      `${id}-route-table-association-private-subnet-a`,
      {
        routeTableId: privateRouteTable.id,
        subnetId: privateSubnetA.id,
      }
    );

    new routeTableAssociation.RouteTableAssociation(
      this,
      `${id}-route-table-association-private-subnet-c`,
      {
        routeTableId: privateRouteTable.id,
        subnetId: privateSubnetC.id,
      }
    );

    Aspects.of(this).add(new Tagged({ CreatedBy: "cdktf", Project: id }));
  }
}

const app = new App();

new VpcStack(app, "cdktf-for-vpc");

app.synth();
