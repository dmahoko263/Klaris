import { DataTypes, Model } from "sequelize";

export class ContractDeployment extends Model {}

export function initContractDeployment(sequelize) {
  ContractDeployment.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      chainId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      contractName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      contractAddress: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      deployedByWallet: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      deployedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "ContractDeployment",
      tableName: "contract_deployments",
      underscored: true,
      indexes: [
        {
          unique: true,
          fields: ["chain_id", "contract_address"],
        },
      ],
    }
  );
}