import Vue from "vue";
import App from "./App.vue";
import store from "./store";
import ElementUI from "element-ui";
import "./assets/styles/element-variables.scss";
import locale from "element-ui/lib/locale/lang/ru-RU";
import axios from "axios";

Vue.use(ElementUI, { locale });

Vue.config.productionTip = false;

const initialProps = {
  accountId: 31355990,
  appName: "rkrs_sledopyt",
};

axios.interceptors.request.use(
  (config) => {
    // Если это POST-запрос, добавляем нужные параметры
    if (config.method === "post") {
      // Объединяем существующие параметры с новыми
      config.data = {
        ...config.data,
        amo_account_id: initialProps.accountId,
        app_name: initialProps.appName,
      };
    }

    // Добавляем ID в URL, если URL соответствует нужному пути
    if (
      config.url &&
      config.url.includes("api/v1/rkrs_sledopyt/projects/upload")
    ) {
      config.url = `${config.url}/${initialProps.accountId}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

new Vue({
  store,
  render: (h) => h(App),
}).$mount("#app");
