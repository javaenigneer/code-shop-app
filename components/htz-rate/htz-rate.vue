<template>
	<view class="htz-rate-main">
		<template v-for="(item,index) in count">
			<image @click="checkItem((index+1))" class="htz-rate-image" :key="index" :style="{'width':size+'rpx','height':size+'rpx','padding-right':gutter+'rpx'}"
			 :src="checkedVal<(index+1)?defImgSrc:selImgSrc"></image>
		</template>

	</view>
</template>

<script>
	export default {
		name: 'htz-rate',
		props: {
			value: { //受控分值
				type: Number,
				default: 0,
			},
			count: { //数量
				type: Number,
				default: 5,
			},
			size: { //图标大小
				type: Number,
				default: 50,
			},
			gutter: { //图标间距
				type: Number,
				default: 15,
			},
			type: { //内置类型
				type: Number,
				default: 0,
			},
			disHref: { //自定义默认图片
				type: String,
				default: '',
			},
			checkedHref: { //自定义选中图片
				type: String,
				default: '',
			},
			readonly: { //是否只读
				type: Boolean,
				default: false,
			},
		},
		data() {
			return {
				ImgData: ['../../static/htz-rate/rate1_0.png', '../../static/htz-rate/rate2_0.png',
					'../../static/htz-rate/rate3_0.png', '../../static/htz-rate/rate4_0.png', '../../static/htz-rate/rate5_0.png',
					'../../static/htz-rate/rate6_0.png'
				],
				defImgSrc: '',
				selImgSrc: '',
				checkedVal: 0,
			}
		},
		mounted: function() {
			this.$nextTick(function() {
				this.checkedVal = this.value;
				if (this.disHref != '') {
					this.defImgSrc = this.disHref;
					this.selImgSrc = this.checkedHref;
				} else {
					//if (this.type != undefined) {
					this.defImgSrc = this.ImgData[this.type];
					this.selImgSrc = this.ImgData[this.type].replace('_0', '_1');
					//}
				}

			});
		},
		watch: {
			value(val, oldVal) {
				this.checkedVal = this.value;
			},
		},
		methods: {
			checkItem(index) {
				if (!this.readonly) {
					this.checkedVal = index;
					this.$emit("input", index);
					this.$emit("change", index);
				}
			},

		}
	}
</script>

<style>
	.htz-rate-main {
		display: inline-flex;
	}
	
	.htz-rate-image{
		vertical-align: middle;
	}


	.htz-image-upload-list {
		display: flex;
		flex-wrap: wrap;
	}

	.htz-image-upload-Item {
		width: 160rpx;
		height: 160rpx;
		margin: 13rpx;
		border-radius: 10rpx;
		position: relative;
	}

	.htz-image-upload-Item image {
		width: 100%;
		height: 100%;
		border-radius: 10rpx;
	}

	.htz-image-upload-Item-add {
		font-size: 105rpx;
		/* line-height: 160rpx; */
		text-align: center;
		border: 1px dashed #d9d9d9;
		color: #d9d9d9;
	}

	.htz-image-upload-Item-del {
		background-color: #f5222d;
		font-size: 24rpx;
		position: absolute;
		width: 35rpx;
		height: 35rpx;
		line-height: 35rpx;
		text-align: center;
		top: 0;
		right: 0;
		z-index: 100;
		color: #fff;
	}
</style>
