<template>
  <el-card style="margin-top: 40px" shadow="never" v-loading="loading">
    <div class="balance-component">
      <div class="balance-component__link-wrapper">
        <div class="balance-info">{{ balance }} ₽</div>
        <a
          class="link"
          href="https://web.whatsapp.com/send?phone=79214377886"
          target="_blank"
          >Задать вопрос менеджеру <external_link_icon :color="'#909399'"
        /></a>
      </div>

      <el-select
        v-model="paymentMethod"
        placeholder="+ Пополнить"
        @change="handlePaymentMethodChange"
      >
        <el-option-group label="Способ оплаты">
          <el-option label="Эквайринг" value="acquiring"></el-option>
          <el-option
            label="Расчётный счёт"
            value="checking_account"
          ></el-option>
        </el-option-group>
      </el-select>

      <el-dialog
        width="350px"
        :close="(paymentMethod = null)"
        :modal-append-to-body="false"
        title="Эквайринг"
        :visible.sync="acquiringDialogVisible"
      >
        <span
          style="margin-bottom: 20px; font-weight: 400; font-family: 'Roboto'"
          >Введите нужную сумму в поле</span
        >
        <el-input
          v-loading="dialogLoading"
          type="number"
          style="width: 240px"
          v-model="paymentAmount"
          placeholder="Введите сумму оплаты"
        ></el-input>
        <div slot="footer" class="dialog-footer">
          <el-button style="width: 240px" type="primary" @click="handlePayment"
            >Оплатить</el-button
          >
          <a
            class="dialog-footer__link"
            href="https://web.whatsapp.com/send?phone=79214377886"
            target="_blank"
            @click="acquiringDialogVisible = false"
            >Задать вопрос менеджеру <external_link_icon :color="'#909399'"
          /></a>
        </div>
      </el-dialog>
    </div>
  </el-card>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { external_link_icon } from "../assets/icons/index";
import axios from "axios";

@Component({
  components: {
    external_link_icon,
  },
})
export default class BalanceComponent extends Vue {
  public paymentMethod: string | null = null;
  public acquiringDialogVisible = false;
  public paymentAmount: number | null = null;
  public balance: number | null = null;
  public selectOpened = false;
  public loading = false;
  public dialogLoading = false;

  async created() {
    this.loading = true;
    await this.fetchBalance();
    this.loading = false;
  }

  async fetchBalance() {
    try {
      const response = await axios.post(
        "https://ssd.rkrs.ru/api/v1/rkrs_sledopyt/balance/get"
      );
      this.balance = response.data.balance;
    } catch (error) {
      console.error("Ошибка при получении баланса:", error);
    }
  }

  handlePaymentMethodChange(value: string) {
    if (value === "acquiring") {
      this.acquiringDialogVisible = true;
    } else if (value === "checking_account") {
      window.open("https://web.whatsapp.com/send?phone=79214377886", "_blank");
    }
  }

  handlePayment() {
    if (!this.paymentAmount) {
      this.$message({
        type: "error",
        message: "Ошибка оплаты: сумма должна быть больше нуля!",
      });
      this.acquiringDialogVisible = false;
    } else {
      this.dialogLoading = true;
      axios
        .post("https://ssd.rkrs.ru/api/pay/integration/free", {
          total: this.paymentAmount,
        })
        .then((response) => {
          this.dialogLoading = false;

          if (response.data.status) {
            this.paymentAmount = null;
            this.acquiringDialogVisible = false;
            if ("sber_pay_url" in response.data) {
              window.open(response.data.sber_pay_url, "_blank");
            } else {
              location.reload();
            }
          } else {
            this.$message({
              type: "error",
              message: "Ошибка оплаты",
            });
          }
        });
    }
  }
}
</script>

<style lang="scss">
.balance-component {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 30px 20px;

  &__link-wrapper {
    position: relative;

    .link {
      position: absolute;
      text-decoration: none;
      display: flex;
      align-items: center;
      font-family: "Roboto";
      top: 28px;
      white-space: nowrap;
      font-size: 10px;
      font-weight: 400;
      color: #909399;
      margin: 10px 0 20px 0;
    }
  }

  .balance-info {
    font-size: 20px;
    color: #17505b;
    font-weight: 500;
    width: 200px;
    padding: 7.5px 20px;
    border-radius: 4px 0px 0px 4px;
    border-top: 1px solid #dcdfe6;
    border-bottom: 1px solid #dcdfe6;
    border-left: 1px solid #dcdfe6;
    background: #fafafa;
  }

  .el-select .el-input__inner {
    background-color: #e8eeef;
    border-color: #8ba8ad;
    width: 145px;
    border-radius: 0 4px 4px 0;
  }

  .el-select ::placeholder,
  .el-select .el-input .el-select__caret {
    color: #17505b;
    font-weight: 500;
    font-family: "Roboto";
  }

  .el-dialog {
    &__header {
      display: flex;
      align-items: center;
      padding: 14px 20px;
      background-color: #e8eeef;
      font-family: Roboto;
      font-size: 24px;
      font-weight: 500;
    }

    &__body {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 40px 20px 0 20px;
    }
  }
  .dialog-footer {
    display: flex;
    flex-direction: column;
    align-items: center;

    &__link {
      text-decoration: none;
      display: flex;
      align-items: center;
      font-family: "Roboto";
      font-size: 12px;
      font-weight: 400;
      color: #909399;
      margin: 10px 0 20px 0;
    }
  }

  /* Для всех браузеров */
  .el-input__inner[type="number"]::-webkit-outer-spin-button,
  .el-input__inner[type="number"]::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  /* Для Firefox */
  .el-input__inner[type="number"] {
    -moz-appearance: textfield;
  }
}
</style>
