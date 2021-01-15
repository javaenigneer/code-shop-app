<template>
	<view class="content">
		<view class="login-bg">
			<view class="login-card">
				<view class="login-head">请输入你的账户</view>
				<view class="login-input login-margin-b">
					<input type="number" v-model="loginInfo.phone" placeholder="手机号或者邮箱" />
				</view>
				<view class="login-input">
					<input type="password" v-model="loginInfo.password" placeholder="请输入密码(6-10位)" />
				</view>
				<view class="login-function">
					<view class="login-forget" @click="go_forget">忘记密码</view>
					<view class="login-register" @click="go_register">快速注册></view>
				</view>
			</view>
		</view>
		<view class="login-btn" @click="loginin">
			<button class="landing" type="primary">登陆</button>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				title: 'Hello',

				loginInfo: {
					"phone": "",
					"password": '',
				}
			}
		},
		onLoad() {
			this.autoLogin();

		},
		methods: {
			autoLogin() {
				let user = this.getUser();
				let mobile = user.mobile;
				let password = this.$dataLocal("password");
				if (!!mobile) this.loginInfo.mobile = mobile;
				if (!!password) this.loginInfo.password = password;
				if (!!mobile && !!password) {
					//this.loginin();
				}
			},
			loginin() {

				if (this.$isNull(this.loginInfo.phone)) {
					this.$toast('请输入手机号')
					return;
				}
				if (this.$isNull(this.loginInfo.password)) {
					this.$toast('请输入密码')
					return;
				}
				uni.request({
					url: 'http://localhost:8888/codeworld-auth/member-login',
					method: 'POST',
					data: JSON.stringify(this.loginInfo),
					success: (response) => {
						if (response.data.code === 20000) {
							this.$toast(response.data.msg);
							let member = response.data.data;
							this.$dataLocal("token", response.data.data);
							delete response.data.data
							// 根据Token获取会员信息
							this.getMemberInfo(this.$dataLocal("token"));
							// this.$dataLocal("user_info", member.memberInfo)
							// let pre_reg_page = this.$dataLocal("pre_reg_page");
							// if (!!pre_reg_page) {
							// 	this.$dataLocal("pre_reg_page", null);
							// 	this.$redirectTo(pre_reg_page);
							// } else {
							// 	this.$redirectTo("/pages/index/index");
							// }
						} else {
							this.$toast(response.data.msg)
							return;
						}
					}
				})
			},
			// 根据Token获取用户信息
			getMemberInfo(token) {
				// 判断token是否存在
				if (this.$isNull(this.$dataLocal("token"))) {
					this.$toast('请重新登录')
					this.$navigateTo('/pages/login/login')
				}
				uni.request({
					header:{'token':this.$dataLocal("token")},
					url: 'http://localhost:8888/codeworld-auth/get-member-info',
					data: {
						token: this.$dataLocal("token")
					},
					method: 'POST',
					success: (response) => {
						let member = response.data.data
						this.$dataLocal("user_info", member.memberInfo)
						this.$dataLocal("address",member.receiverAddresses)
						let pre_reg_page = this.$dataLocal("pre_reg_page");
						if (!!pre_reg_page) {
							this.$dataLocal("pre_reg_page", null);
							this.$redirectTo(pre_reg_page);
						} else {
							this.$redirectTo("/pages/index/index");
						}
					}
				})

			},

			go_forget() {
				this.$navigateTo('/pages/login/forget')

			},
			go_register() {
				this.$navigateTo('/pages/login/register')
			}

		}
	}
</script>

<style>
	.landing {
		height: 84upx;
		line-height: 84upx;
		border-radius: 44upx;
		font-size: 32upx;
		background: linear-gradient(left, #FF978D, #FFBB69);
	}

	.login-btn {
		padding: 10upx 20upx;
		margin-top: 350upx;
	}

	.login-function {
		overflow: auto;
		padding: 20upx 20upx 30upx 20upx;
	}

	.login-forget {
		float: left;
		font-size: 26upx;
		color: #999;
	}

	.login-register {
		color: #666;
		float: right;
		font-size: 26upx;

	}

	.login-input input {
		background: #F2F5F6;
		font-size: 28upx;
		padding: 10upx 25upx;
		height: 62upx;
		line-height: 62upx;
		border-radius: 8upx;
	}

	.login-margin-b {
		margin-bottom: 25upx;
	}

	.login-input {
		padding: 10upx 20upx;
	}

	.login-head {
		font-size: 34upx;
		text-align: center;
		padding: 25upx 10upx 55upx 10upx;
	}

	.login-card {
		background: #fff;
		border-radius: 12upx;
		padding: 10upx 25upx;
		box-shadow: 0 6upx 18upx rgba(0, 0, 0, 0.12);
		position: relative;
		margin-top: 120upx;
	}

	.login-bg {
		height: 260upx;
		padding: 25upx;
		background: linear-gradient(#FF978D, #FFBB69);
	}
</style>
