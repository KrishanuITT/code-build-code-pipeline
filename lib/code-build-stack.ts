import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

export class CodeBuildStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const vpc = new ec2.Vpc(this, 'Vpc');
        const cluster = new ecs.Cluster(this, 'Cluster', { vpc });
        const repository = ecr.Repository.fromRepositoryName(this, 'EcrRepo', 'err-repo');
        const image = ecs.ContainerImage.fromEcrRepository(repository,'latest');

        const taskDefinition = new ecs.FargateTaskDefinition(this, 'TaskDef');
        taskDefinition.addContainer('Container', {
            image: ecs.ContainerImage.fromEcrRepository(repository),
            memoryLimitMiB: 512,
            cpu: 256
        });

        const service = new ecs.FargateService(this, 'ecs-service',{
          cluster,
          taskDefinition,
          desiredCount:0
        })

        new lambda.Function(this, 'LambdaFunction', {
            runtime: lambda.Runtime.PYTHON_3_10,
            code: lambda.Code.fromAsset('lib/lambda'),
            handler: 'index.handler'
        });
        new s3.Bucket(this,'Bucket',{
          bucketName: 'bucket-name',
          removalPolicy: cdk.RemovalPolicy.DESTROY
        })
    }
}