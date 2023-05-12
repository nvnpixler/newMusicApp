const Sequelize = require('sequelize');
module.exports = function (sequelize, DataTypes) {
    const users = sequelize.define('users', {
        id: {
            autoIncrement: true,
            type: DataTypes.BIGINT,
            allowNull: false,
            primaryKey: true
        },
        role: {
            type: DataTypes.ENUM("0", "1", "2"),
            allowNull: true,
            defaultValue: "2",
            comment: "0=admin, 1=singer, 2=user"
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: '',
        },
        email: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: '',
        },
        password: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: '',
        },
        country_code: {
            type: DataTypes.STRING(5),
            allowNull: true,
            defaultValue: '',
        },
        phone: {
            type: DataTypes.STRING(15),
            allowNull: true,
            defaultValue: "",
        },
        image: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: '',
        },
        image_thumb: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: '',
        },
        aadhar_image: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: '',
        },
        aadhar_image_thumb: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: '',
        },
        aadhar_image_back: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: '',
        },
        aadhar_image_back_thumb: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: '',
        },
        status: {
            type: DataTypes.ENUM("0", "1"),
            allowNull: false,
            defaultValue: "1",
            comment: "0=inactive, 1=active"
        },
        otp: {
            type: DataTypes.INTEGER(1),
            allowNull: true,
            defaultValue: 0
        },
        is_otp_verified: {
            type: DataTypes.INTEGER(1),
            allowNull: true,
            defaultValue: 0,
            comment: "0=not, 1=yes"
        },
        device_token: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: "",
        },
        device_type: {
            type: DataTypes.TINYINT(1),
            allowNull: true,
            defaultValue: 0
        },
        notification_status: {
            type: DataTypes.INTEGER(1),
            allowNull: true,
            defaultValue: 1
        },
        reset_token: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: '',
        },
        social_type: {
            type: DataTypes.INTEGER(1),
            allowNull: true,
            defaultValue: 0,
            comment: '1=google,2=facebook,3=apple'
        },
        social_id: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: '',
        },
        login_time: {
            type: DataTypes.STRING(20),
            allowNull: true,
            defaultValue: '0'
        },
        is_popil_buds: {
            type: DataTypes.INTEGER(1),
            allowNull: true,
            defaultValue: 0
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        },
        updated_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        }
    }, {
        sequelize,
        tableName: 'users',
        timestamps: false,
        indexes: [
            {
                name: "PRIMARY",
                unique: true,
                using: "BTREE",
                fields: [
                    { name: "id" },
                ]
            },
        ],
    });

    // Sync the model with the database
    users.sync()
        .then(() => {
            console.log('User table created successfully.');
        })
        .catch((error) => {
            console.error('Error creating User table:', error.message);
        });

    users.associate = models => {
        users.hasMany(models.transactions, { foreignKey: 'user_id', hooks: false, as: 'user' });
        users.hasOne(models.singer_banks, { foreignKey: 'user_id', hooks: false });
    };

    return users;
};
