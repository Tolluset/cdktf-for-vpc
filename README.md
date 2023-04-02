## cdktf-for-vpec


CDK for terraform / typescript로 Amazon VPC를 만드는 예제입니다.

## 블로그링크

Amazon VPC 생성
https://dev.classmethod.jp/articles/cdktf-amazon-vpc-typescript/

유닛 테스트
https://dev.classmethod.jp/articles/cdktf-unit-test-typescript/

- 유닛 테스트 추가하면서 문서에 안되는 부분이 있어서 PR
  - https://github.com/hashicorp/terraform-cdk/pull/2756

## How to deploy

```bash
pnpm install
cdktf deploy
```

## How to test

```bash
pnpm test
pnpm test:update # to update snapshots
```
