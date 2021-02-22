<template>
	<view class="content">
		<view class="navbar">
			<view v-for="(item, index) in navList" :key="index" class="nav-item" :class="{current: tabCurrentIndex === index}"
			 @click="tabClick(item.state)">
				{{item.text}}
			</view>
		</view>




		<!-- 订单列表 -->
		<view v-for="(item,index) in orderList" :key="index" class="order-item">
			<view class="i-top b-b">
				<text class="time">{{item.createTime}}</text>
				<text class="state" style="color:#aaaaff">{{item.statName}}</text>

				<text v-if="item.stat===1" class="del-btn iconfont iconicon_delete_fill" style="color: #aaaaff;" @click="cancelOrder(item)"></text>

			</view>

			<scroll-view v-if="item.goodsInfo.length > 1" class="goods-box" scroll-x>
				<view v-for="(goodsItem, goodsIndex) in item.goodsInfo" :key="goodsIndex" class="goods-item">
					<image class="goods-img" :src="goodsItem.productImage" mode="aspectFill"></image>
				</view>
			</scroll-view>

			<view v-if="item.goodsInfo.length== 1" class="goods-box-single" v-for="(ite, idx) in item.goodsInfo" :key="idx">


				<image class="goods-img" :src="ite.productImage" mode="aspectFill"></image>
				<view class="right">
					<text class="title clamp"> {{ite.productTitle}}</text>
					<text class="attr-box">
						<text style="color: #00BFFF;" v-if="''!=ite.productSkuModel.title">{{ite.productSkuModel.title}}</text>
						<text v-else>.</text>
					</text>
					<text class="price">{{ite.productSkuModel.price}}</text>
				</view>
			</view>

			<view class="price-box">
				共
				<text class="num">{{getCount(item)}}</text>
				件商品 实付款
				<text class="price">{{getAmount(item)}}</text>
			</view>

			<view class="action-box b-t" v-if="item.orderStatus == 1">
				<button class="action-btn" @click="cancelOrder(item)">取消订单</button>
				<button class="action-btn recom" @click="topay(item)">立即支付</button>
			</view>

			<view class="action-box b-t" v-if="item.orderStatus == 2">
				<button class="action-btn" @click="tuikuan(item)">退款</button>
				<button class="action-btn" @click="$toast('已经像商家推送消息啦')">催发货</button>

			</view>

			<view class="action-box b-t" v-if="item.orderStatus == 3">
				<button class="action-btn" @click="showLogistics(item)">查看物流</button>

				<button class="action-btn" @click="confirmReceipt(item)">确认收货</button>

			</view>

			<view class="action-box b-t" v-if="item.orderStatus == 4">
				<button class="action-btn" @click="to_comment(item)">评价</button>
				<button class="action-btn" @click="to_return(item)">申请售后</button>

			</view>

		</view>





		<swiper :current="tabCurrentIndex" class="swiper-box" duration="300" @change="changeTab">
			<swiper-item class="tab-content">
				<!-- v-for="(tabItem,tabIndex) in navList" :key="tabIndex" -->
				<scroll-view class="list-scroll-content" scroll-y @scrolltolower="loadData">
					<!-- 空白页 -->
					<empty v-if="orderList.length==0"></empty>

					<uni-load-more :status="'nomore'"></uni-load-more>

				</scroll-view>
			</swiper-item>
		</swiper>
	</view>
</template>

<script>
	import uniLoadMore from '@/components/uni-load-more/uni-load-more.vue';
	import empty from "@/components/empty/empty";


	export default {
		components: {
			uniLoadMore,
			empty
		},
		data() {
			let _conf = this.getConst();
			let _user = this.getUser();

			return {
				conf: _conf,

				logisterMap: _conf.logisterMap,
				logi_corp: "",
				logi_no: "",
				logistics: [],





				tabCurrentIndex: 0,
				navList: [{
						state: 0,
						text: '全部',
					},
					{
						state: 1,
						text: '待付款',
					},
					{
						state: 2,
						text: '待发货',

					},
					{
						state: 3,
						text: '待收货',

					},
					{
						state: 4,
						text: '待评价',
					}
				],
				userInfo: _user,

				cond: {
					orderStatus: "0"
				},
				orderList: [],
			};
		},

		onLoad(options) {
			let _stat = parseInt(options.stat);
			if (this.$isNull(_stat)) {
				_stat = 0;
			}
			this.tabClick(_stat);

		},

		watch: {

		},
		onReachBottom() {
			this.load_list();


		},
		onPullDownRefresh() {

		},
		methods: {
			// 确认收货
			confirmReceipt(item) {
				uni.showModal({
					title: '提示',
					content: '亲，确定要收货吗',
					success: function(res) {
						if (res.confirm) {
							uni.request({
								url: 'http://localhost:8888/codeworld-order/app/confirm-receipt?orderDetailId=' + item.orderDetailId,
								header: {
									'token': this.$dataLocal("token")
								},
								method: 'POST',
								success: (response) => {
									let result = response.data;
									if (result.code === 20000) {
										uni.showToast({
											title: '收货成功'
										});
										setTimeout(function() {
											uni.navigateTo({
												"url": "/pages/order/order?state=4"
											})
										}, 3000)
									} else {
										this.$toast({
											title: result.msg
										})
									}
								}
							})
						} else if (res.cancel) {
							console.log('用户点击取消');
						}
					}.bind(this)
				});
			},
			topay(item) {
				let order_id = item.orderId;
				// let money = item.totalPay - item.benefit + item.postage;
				let money = item.totalPay;
				if (this.isWeixin()) {
					//location.replace('./external/wxpay.html?order_id='+order_id+'&money='+money);
					this.$post("order/hpj_unifield", {
						"order_id": order_id
					}, (res2) => {
						if (res2.status != 200) {
							alert(res2.msg)
							return;
						}
						var obj = JSON.parse(res2.data);
						var url = obj.url;
						this.$jumpExter(url);
					})

				} else {
					this.$redirectTo('/pages/pay/pay?order_id=' + order_id + '&money=' + money);
				}

			},

			to_comment(e) {
				this.$navigateTo("/pages/order/comment?id=" + e.orderDetailId);
			},

			showLogistics(item) {
				console.log(item)

				var post_detail = {};
				if (!!item.postDetail) {
					post_detail = JSON.parse(item.postDetail)
				}
				if (post_detail.type == "ziti") {
					this.$toast("该订单的商品已经自提");
					return;
				}
				let uri = "/pages/order/logister?order=" + post_detail.order + "&type=" + post_detail.type;
				this.$navigateTo(uri);
			},

			tuikuan(item) {
				uni.showModal({
					title: '提示',
					content: '亲，确定要发起退款嘛',
					success: function(res) {
						if (res.confirm) {
							uni.request({
								url: 'http://localhost:8888/codeworld-order/app/refund-order?orderDetailId=' + item.orderDetailId,
								header: {
									'token': this.$dataLocal("token")
								},
								method: 'POST',
								success: (response) => {
									let result = response.data;
									if (result.code === 20000) {
										uni.showToast({
											title: '申请成功'
										});
										setTimeout(function() {
											uni.navigateTo({
												"url": "/pages/order/order-refund?state=7"
											})
										}, 3000)
									} else {
										this.$toast({
											title: result.msg
										})
									}
								}
							})
						} else if (res.cancel) {
							console.log('用户点击取消');
						}
					}.bind(this)
				});
			},
			// 取消订单
			cancelOrder(item) {
				uni.showModal({
					title: '提示',
					content: '亲，确定要取消订单嘛',
					success: function(res) {
						if (res.confirm) {
							uni.request({
								url: 'http://localhost:8888/codeworld-order/app/cancel-order?orderId=' + item.orderId,
								header: {
									'token': this.$dataLocal("token")
								},
								method: 'POST',
								success: (response) => {
									let result = response.data;
									if (result.code === 20000) {
										uni.showToast({
											title: result.msg
										});
										setTimeout(function() {
											uni.navigateTo({
												"url": "/pages/order/order?state=''"
											})
										}, 3000)
									} else {
										this.$toast({
											title: result.msg
										})
									}
								}
							})
						} else if (res.cancel) {
							console.log('用户点击取消');
						}
					}.bind(this)
				});
			},
			to_return(e) {
				this.$navigateTo("/pages/order/return?order_id=" + e.id);
			},

			getAmount(e) {
				let o = this.getGlistData(e);
				return o.amount;
			},
			getCount(e) {
				let o = this.getGlistData(e);
				return o.count;
			},

			getGlistData(e) {
				let sum = 0,
					n = 0;
				let li = e.goodsInfo;
				for (let i in li) {
					let ite = li[i];
					let m = parseFloat(ite.productCount) * parseFloat(ite.productSkuModel.price);
					sum += m;
					n++;
				}
				return {
					"amount": sum,
					"count": n
				};


			},

			getBillStat(stat) {
				if (stat == 1) {
					return "待付款"
				} else if (2 == stat) {
					return "待发货"
				} else if (3 == stat) {
					return "待收货"
				} else if (4 == stat) {
					return "待评价"
				} else if (8 == stat) {
					return "售后"
				} else if (7 == stat) {
					return "无效订单"
				} else if (5 == stat) {
					return "订单已关闭"
				} else {
					return "无状态"
				}

			},


			set_stat() {
				this.cond.orderStatus = this.tabCurrentIndex;
				if (0 == this.cond.orderStatus) this.cond.orderStatus = "";
			},

			reload_list() {
				this.orderList = [];
				this.cond.page = 1;
				this.cond.limit = 5;
				this.load_list();

			},
			// 默认查询全部订单
			load_list() {
				let memberInfo = this.$dataLocal("user_info");
				if (this.$isNull(memberInfo)) {
					this.$toast("请重新登录");
					this.$navigateTo("/pages/login/login");
					return;
				}
				uni.request({
					url: 'http://localhost:8888/codeworld-order/app/get-page-member-order',
					header: {
						'token': this.$dataLocal('token')
					},
					method: 'POST',
					data: this.cond,
					success: (response) => {
						if (response.data.code === 20000) {
							let li = response.data.data;
							console.log(li)
							for (let i in li) {
								let ite = li[i];
								ite.statName = this.getBillStat(ite.orderStatus);
								ite.goodsInfo = ite.productModels;
							}
							this.orderList = this.orderList.concat(li);
							this.cond.page++;
						}
					}
				})
				// this.$post("order/query",this.cond,res=>{
				// 	let li=res.rows;
				// 	for(let i in li){
				// 		let ite=li[i];
				// 		ite.statName=this.getBillStat(ite.stat);
				// 		ite.goodsInfo=JSON.parse(ite.goodsDetail);
				// 		//ite.sku=JSON.parse(ite.goodsDetail).sku;
				// 	}
				// 	this.orderList=this.orderList.concat(li);
				// 	this.cond.pagefrom++;
				// })
			},


			tabClick(e) {
				//console.log(e);
				this.tabCurrentIndex = e;
				this.set_stat();
				this.reload_list();

			},
			changeTab(e) {
				let idx = e.detail.current;

				/* this.tabCurrentIndex=idx;			
				this.set_stat();
				this.reload_list(); */


			},



		},
	}
</script>

<style lang="scss">
	page,
	.content {
		background: #f8f8f8;
		height: 100%;
	}

	.swiper-box {
		height: calc(100% - 40px);
	}

	.list-scroll-content {
		height: 100%;
	}

	.navbar {
		display: flex;
		height: 40px;
		padding: 0 5px;
		background: #fff;
		box-shadow: 0 1px 5px rgba(0, 0, 0, .06);
		position: relative;
		z-index: 10;

		.nav-item {
			flex: 1;
			display: flex;
			justify-content: center;
			align-items: center;
			height: 100%;
			font-size: 15px;
			color: #333333;
			position: relative;

			&.current {
				color: #fa436a;

				&:after {
					content: '';
					position: absolute;
					left: 50%;
					bottom: 0;
					transform: translateX(-50%);
					width: 44px;
					height: 0;
					border-bottom: 2px solid #fa436a;
				}
			}
		}
	}

	.uni-swiper-item {
		height: auto;
	}

	.order-item {
		display: flex;
		flex-direction: column;
		padding-left: 30upx;
		background: #fff;
		margin-top: 16upx;

		.i-top {
			display: flex;
			align-items: center;
			height: 80upx;
			padding-right: 30upx;
			font-size: 28upx;
			color: #333333;
			position: relative;

			.time {
				flex: 1;
			}

			.state {
				color: #fa436a;
			}

			.del-btn {
				padding: 10upx 0 10upx 36upx;
				font-size: 32upx;
				color: #f8f6fc;
				position: relative;

				&:after {
					content: '';
					width: 0;
					height: 30upx;
					border-left: 1px solid #a6a9b0;
					position: absolute;
					left: 20upx;
					top: 50%;
					transform: translateY(-50%);
				}
			}
		}

		/* 多条商品 */
		.goods-box {
			height: 160upx;
			padding: 20upx 0;
			white-space: nowrap;

			.goods-item {
				width: 120upx;
				height: 120upx;
				display: inline-block;
				margin-right: 24upx;
			}

			.goods-img {
				display: block;
				width: 100%;
				height: 100%;
			}
		}

		/* 单条商品 */
		.goods-box-single {
			display: flex;
			padding: 20upx 0;

			.goods-img {
				display: block;
				width: 120upx;
				height: 120upx;
			}

			.right {
				flex: 1;
				display: flex;
				flex-direction: column;
				padding: 0 30upx 0 24upx;
				overflow: hidden;

				.title {
					font-size: 28upx + 2upx;
					color: #333333;
					line-height: 1;
				}

				.attr-box {
					font-size: 24upx + 2upx;
					color: #f8f6fc;
					padding: 10upx 12upx;
				}

				.price {
					font-size: 28upx + 2upx;
					color: #333333;

					&:before {
						content: '￥';
						font-size: 24upx;
						margin: 0 2upx 0 8upx;
					}
				}
			}
		}

		.price-box {
			display: flex;
			justify-content: flex-end;
			align-items: baseline;
			padding: 20upx 30upx;
			font-size: 24upx + 2upx;
			color: #000000;

			.num {
				margin: 0 8upx;
				color: #333333;
			}

			.price {
				font-size: 32upx;
				color: #333333;

				&:before {
					content: '￥';
					font-size: 24upx;
					margin: 0 2upx 0 8upx;
				}
			}
		}

		.action-box {
			display: flex;
			justify-content: flex-end;
			align-items: center;
			height: 100upx;
			position: relative;
			padding-right: 30upx;
		}

		.action-btn {
			width: 160upx;
			height: 60upx;
			margin: 0;
			margin-left: 24upx;
			padding: 0;
			text-align: center;
			line-height: 60upx;
			font-size: 26upx;
			color: #333333;
			background: #fff;
			border-radius: 100px;

			&:after {
				border-radius: 100px;
			}

			&.recom {
				background: #fff9f9;
				color: #fa436a;

				&:after {
					border-color: #f7bcc8;
				}
			}
		}
	}


	/* load-more */
	.uni-load-more {
		display: flex;
		flex-direction: row;
		height: 80upx;
		align-items: center;
		justify-content: center
	}

	.uni-load-more__text {
		font-size: 28upx;
		color: #999
	}

	.uni-load-more__img {
		height: 24px;
		width: 24px;
		margin-right: 10px
	}

	.uni-load-more__img>view {
		position: absolute
	}

	.uni-load-more__img>view view {
		width: 6px;
		height: 2px;
		border-top-left-radius: 1px;
		border-bottom-left-radius: 1px;
		background: #999;
		position: absolute;
		opacity: .2;
		transform-origin: 50%;
		animation: load 1.56s ease infinite
	}

	.uni-load-more__img>view view:nth-child(1) {
		transform: rotate(90deg);
		top: 2px;
		left: 9px
	}

	.uni-load-more__img>view view:nth-child(2) {
		transform: rotate(180deg);
		top: 11px;
		right: 0
	}

	.uni-load-more__img>view view:nth-child(3) {
		transform: rotate(270deg);
		bottom: 2px;
		left: 9px
	}

	.uni-load-more__img>view view:nth-child(4) {
		top: 11px;
		left: 0
	}

	.load1,
	.load2,
	.load3 {
		height: 24px;
		width: 24px
	}

	.load2 {
		transform: rotate(30deg)
	}

	.load3 {
		transform: rotate(60deg)
	}

	.load1 view:nth-child(1) {
		animation-delay: 0s
	}

	.load2 view:nth-child(1) {
		animation-delay: .13s
	}

	.load3 view:nth-child(1) {
		animation-delay: .26s
	}

	.load1 view:nth-child(2) {
		animation-delay: .39s
	}

	.load2 view:nth-child(2) {
		animation-delay: .52s
	}

	.load3 view:nth-child(2) {
		animation-delay: .65s
	}

	.load1 view:nth-child(3) {
		animation-delay: .78s
	}

	.load2 view:nth-child(3) {
		animation-delay: .91s
	}

	.load3 view:nth-child(3) {
		animation-delay: 1.04s
	}

	.load1 view:nth-child(4) {
		animation-delay: 1.17s
	}

	.load2 view:nth-child(4) {
		animation-delay: 1.3s
	}

	.load3 view:nth-child(4) {
		animation-delay: 1.43s
	}

	@-webkit-keyframes load {
		0% {
			opacity: 1
		}

		100% {
			opacity: .2
		}
	}
</style>
