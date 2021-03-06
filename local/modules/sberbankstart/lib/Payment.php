<?php

namespace Bitrix\SberBankStart;

use Bitrix\Main\Config\Option;


class Payment
{

    public string $moduleID = 'sberbankstart'; //Изменить на ID своего модуля
    public bool $test;
    public Helper $sberHelper;
    private string $login;
    private string $password;
    private string $token;

    public function __construct()
    {
        $this->sberHelper = new Helper();
        $testOption = $this->sberHelper->getOption('TEST');
        $this->test = $testOption === 'Y';
        $this->token = $this->sberHelper->getOption('TOKEN');
        if (!$this->token) {
            $this->login = $this->sberHelper->getOption('LOGIN');
            $this->login = $this->sberHelper->getOption('PASSWORD');
        }
    }

    /**
     * Возвращает ссылку для обратного редиректа
     * @return string
     */
    private function getUrl(): string
    {
        return ((!empty($_SERVER['HTTPS'])) ? 'https' : 'http') . '://' . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];
    }

    /**
     * Регистирует новый заказ в Сбербанке по цене
     *
     * @param string $amount
     * @param array $jsonParams
     * @return mixed
     */
    public function registerSberbank(string $amount, array $jsonParams = []): array
    {
        $result = ['status' => 'error', 'error' => ''];

        $authParams = $this->getAuthorizeParams();

        if (isset($authParams['error'])) {
            return $authParams['error'];
        } else {
            $params = $authParams;
        }

        $returnUrl = $this->getUrl();

        if ($this->test) {
            $urlRequest = 'https://3dsec.sberbank.ru/payment/rest/register.do';
        } else {
            $urlRequest = 'https://securepayments.sberbank.ru/payment/rest/register.do';
        }


        $params['amount'] = $amount;
        $params['returnUrl'] = $returnUrl;
        $params['failUrl'] = $returnUrl;


        $request = $this->sendRequest($urlRequest, $params, $jsonParams);

        if (isset($request['orderId'])) {
            $result = [
                'status' => 'success',
                'orderId' => $request['orderId'],
                'url' => $request['formUrl']
            ];
        } else {
            $result['error'] = $request['errorCode'];
            $result['errorMessage'] = $request['errorMessage'];
        }

        return $result;
    }

    /**
     * Получает параметры для авторизации в сбербанке
     * @return array|string
     */
    private function getAuthorizeParams(): array
    {
        $params = [];
        if ($this->token) {
            $params['token'] = $this->token;
        } elseif ($this->login && $this->password) {
            $params['userName'] = $this->login;
            $params['password'] = $this->password;
        } else {
            return $params['error'] = 'Установите в настройках поля для авторизациии';
        }
        return $params;
    }

    /**
     * Проверяет, оплачен ли заказ в сбербанке
     *
     * @param string $orderID
     *
     * @return bool
     */
    public function isOrderPaid(string $orderID): bool
    {
        $authParams = $this->getAuthorizeParams();

        if (isset($authParams['error'])) {
            return $authParams['error'];
        } else {
            $params = $authParams;
        }

        if ($this->test) {
            $urlRequest = 'https://3dsec.sberbank.ru/payment/rest/getOrderStatusExtended.do';
        } else {
            $urlRequest = 'https://securepayments.sberbank.ru/payment/rest/getOrderStatusExtended.do';
        }


        $params['orderId'] = $orderID;

        $request = $this->sendRequest($urlRequest, $params);


        return $request['orderStatus'] === 2;
    }

    /**
     * Гет запрос с параметрами
     * @param string $url
     * @param array $params
     * @param array $jsonParams
     * @return array
     */
    protected function sendRequest(string $url, array $params, array $jsonParams = []): array
    {

        $urlFinal = $url . '?' . http_build_query($params);
        if (!empty($jsonParams)) {
            $urlFinal .= '&jsonParams={';
            foreach ($jsonParams as $key => $value) {
                $urlFinal = '"' . $key . '":"' . $value . '"';
                if (!($key === array_key_last($jsonParams))) {
                    $urlFinal .= ',';
                }
            }
            $urlFinal .= '}';
        }
        $curl = curl_init();
        curl_setopt($curl, CURLOPT_CUSTOMREQUEST, "GET");
        curl_setopt($curl, CURLOPT_HTTPHEADER, '');
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($curl, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($curl, CURLOPT_URL, $urlFinal);
        $response = curl_exec($curl);
        curl_close($curl);

        return json_decode($response, true);
    }


}