/**
 * 队列封装
 * @author maxd
 * @date 2019.8.1
 */
module.exports = {
  
    logout() {
      this.remove("token");
      this.remove("mobile");
      this.remove("userName");
	  this.remove("nickName");
      this.remove("type");
	  this.remove("openid");
      this.remove("id");
      this.remove("password");
    },
    loginClear() {
        this.remove("token");
        this.remove("userId");
        this.remove("mobile");
        this.remove("nickName");
        this.remove("image_url");
        this.remove("relation_id");
    },
    showLoading(title) {
        uni.showLoading({
            title: title
        });
    },
    showToast(title) {
        uni.showToast({
            title: title,
            mask: false,
            duration: 2000,
            icon: "none"
        });
    },

    setJson: function (key, value) {
        let jsonString = JSON.stringify(value);
        try {
            uni.setStorageSync(key, jsonString);
        } catch (e) {
            // error
        }
    },
    setData: function (key, value) {
        try {
            uni.setStorageSync(key, value);
        } catch (e) {
            // error
        }
    },
    getData: function (key) {
        try {
            const value = uni.getStorageSync(key);
            if (value) {
                return value;
            }
        } catch (e) {
            // error
        }

    },
    getJson: function (key) {
        try {
            const value = uni.getStorageSync(key);
            if (value) {
                return JSON.parse(value);
            }
        } catch (e) {
            // error
        }

    },
    clear: function () {
        uni.clearStorage();
    },
    get: function (key) { //获取队列里面全部的数据
        let data = this.getJson(key);
        if (data instanceof Array) {
            return data;
        }
        return [];
    },
    insert: function (param) { //队列插入数据
        param.capacityNum = param.capacityNum || 100; //队列容量 默认队列中超过100条数据，自动删除尾部
        let data = this.getJson(param.key);
        if (data instanceof Array) {
            if (data.length > param.capacityNum) {
                let total = data.length - param.capacityNum;
                for (let i = 0; i < total; i++) {
                    data.pop();
                }
            }
            data.unshift(param.value);
        } else {
            data = [];
            data.push(param.value);
        }
        this.setJson(param.key, data);
    }
    ,
    removeItem: function (key, itemIds) { //提供itemIds数组 批量删除队列中的某项数据
        let data = this.getJson(key);
        if (data instanceof Array) {
            for (let i = 0; i < itemIds.length; i++) {
                for (let p = 0; p < data.length; p++) {
                    if (itemIds[i] === data[p]) {
                        data.splice(p, 1);
                        break;
                    }
                }
            }
            this.setJson(key, data);
        }
    },
    isExist: function (key, itemId) { //检测某条数据在队列中是否存在
        let data = this.getJson(key);
        if (data instanceof Array) {
            for (let p = 0; p < data.length; p++) {
                if (itemId === data[p]) {
                    return true;
                }
            }
        }
        return false;
    },
    remove: function (key) { //删除某条队列
        try {
            uni.removeStorageSync(key);
            //localStorage.removeItem(key)
        } catch (e) {
            // error
        }
    },
    getCount: function (key) { //获取队列中全部数据数量

        let data = this.getJson(key);
        if (data instanceof Array) {
            return data.length;
        }
        return 0;
    },
};

