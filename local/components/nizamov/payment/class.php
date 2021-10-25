<?php

if (!defined("B_PROLOG_INCLUDED") || B_PROLOG_INCLUDED !== true) {
    die();
}

use Bitrix\Main\Loader;
use Bitrix\Main\LoaderException;
use Bitrix\Main\Entity;

class Payment extends CBitrixComponent
{

    //Тестовые и боевые доступы от сбербанка
    public string $loginSberTest = '';
    public string $passwordSberTest = '';
    public string $loginSber = '';
    public string $passwordSber = '';

    public $user;

    public function __construct($component = null)
    {
        parent::__construct($component);
        CModule::IncludeModule('iblock');
        CModule::IncludeModule('highloadblock');
        global $USER;
        $this->user = $USER;
    }

    /**
     * Проверяет, установлен ли компонент в режим тестирования
     * @return bool
     */
    public function isTest(): bool
    {
        return $this->arParams['TEST'] === 'Y';
    }

    /**
     * Получает ID инфоблока по символьному коду его типа и его самомого
     *
     * @param $code
     * @param $type
     *
     * @return false|mixed
     */
    public function getIdBlock($code, $type)
    {
        $result = false;
        $res = CIBlock::GetList(
            [],
            [
                'TYPE' => $type,
                'SITE_ID' => SITE_ID,
                'ACTIVE' => 'Y',
                "CNT_ACTIVE" => "Y",
                "CODE" => $code
            ],
            true
        );
        while ($ar_res = $res->Fetch()) {
            $result = $ar_res['ID'];
        }
        return $result;
    }

    /**
     * Возвращает ссылку для обратного редиректа
     * @return string
     */
    public function getUrl(): string
    {
        return ((!empty($_SERVER['HTTPS'])) ? 'https' : 'http') . '://' . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];
    }

    /**
     * Регистирует новый заказ в Сбербанке по цене
     *
     * @param $amount
     *
     * @return mixed
     */
    protected function registerSberbank($amount)
    {
        $returnUrl = $this->getUrl();

        if ($this->isTest()) {
            $request = file_get_contents(
                'https://3dsec.sberbank.ru/payment/rest/register.do?userName=' . $this->loginSberTest . '&password=' . $this->passwordSberTest . '&amount=' . $amount . '&returnUrl=' . $returnUrl .
                '&failUrl=' . $returnUrl
            );
        } else {
            $request = file_get_contents(
                'https://securepayments.sberbank.ru/payment/rest/register.do?userName=' . $this->loginSber . '&password=' . $this->passwordSber . '&amount=' . $amount . '&returnUrl=' . $returnUrl .
                '&failUrl=' . $returnUrl
            );
        }


        return json_decode($request, true);
    }

    /**
     * Получает информацию о статусе заказа сбербанка
     *
     * @param $orderID
     *
     * @return string
     */
    protected function getStatusSberbank($orderID)
    {
        $request = [];
        $arr = [];
        if ($this->isTest()) {
            $request = file_get_contents('https://3dsec.sberbank.ru/payment/rest/getOrderStatusExtended.do?userName=' . $this->loginSberTest . '&password=' . $this->passwordSberTest . '&orderId=' . $orderID);
        } else {
            $request = file_get_contents(
                'https://securepayments.sberbank.ru/payment/rest/getOrderStatusExtended.do?userName=' . $this->loginSber . '&password=' . $this->passwordSber . '&orderId=' . $orderID
            );
        }

        $arr = json_decode($request, true);

        return $arr['orderStatus'] === 2 ? 'Оплачен' : 'Не оплачен';
    }


    /**
     * Создает новую заявку на оплату, возвращает id нового элемента
     *
     * @param $propertyValues
     *
     * @return mixed
     */
    public function createNewPayment($propertyValues)
    {
        $iblockId = $this->getIdBlock($this->arParams['IBLOCK_CODE'], $this->arParams['IBLOCK_TYPE']);
        $arFields = [
            "ACTIVE" => "Y",
            "IBLOCK_ID" => $iblockId,
            "NAME" => "Заявка " . $propertyValues['ORDER_ID'],
            "PROPERTY_VALUES" => $propertyValues
        ];

        $oElement = new CIBlockElement();
        return $oElement->Add($arFields, false, false, true);
    }

    /**
     * Устанавливает статус оплаты в заявку в инфоблоке
     * @param $idSberPayment
     *
     * @return string
     */
    public function setStatusPayment($idSberPayment)
    {
        $iblockId = $this->getIdBlock($this->arParams['IBLOCK_CODE'], $this->arParams['IBLOCK_TYPE']);

        $elementID = $this->getElementIDBySberId($iblockId, $idSberPayment);

        $status = $this->getStatusSberbank($idSberPayment);

        CIBlockElement::SetPropertyValuesEx($elementID, $iblockId, array('STATUS_PAY' => $status));

        return $status;
    }

    /**
     * Получает ID элемента по номеру зазака в Сбербанке
     *
     * @param $iblockId
     * @param $idSberPayment
     *
     * @return false|mixed
     */
    public function getElementIDBySberId($iblockId, $idSberPayment)
    {
        $result = false;
        $arSelect = ["ID", "NAME", 'IBLOCK_ID', 'PROPERTIES_*'];
        $arFilter = [
            "IBLOCK_ID" => $iblockId,
            "ACTIVE_DATE" => "Y",
            "ACTIVE" => "Y",
            '=PROPERTY_ORDER_ID' => $idSberPayment
        ];
        $res = CIBlockElement::GetList([], $arFilter, false, ["nPageSize" => 1], $arSelect);
        while ($ob = $res->GetNextElement()) {
            $arFields = $ob->GetFields();
            $result = $arFields['ID'];
        }

        return $result;
    }


    /**
     * Вызывает все нужные методы для создания новой оплаты
     * @return false|mixed
     */
    public function createAction()
    {
        $result = false;
        //Описать свойства заявки
        $arParameters = [
            'AMOUNT' => $_POST['amount'],
            'STATUS_PAY' => 'Не оплачен',
            'ORDER_ID' => '',
        ];

        $amount = str_replace('.', '', $_POST['amount']);
        $arrSber = $this->registerSberbank($amount);


        if (isset($arrSber['orderId'])) {
            $arParameters['ORDER_ID'] = $arrSber['orderId'];
            $newElement = $this->createNewPayment($arParameters);
            $result = $arrSber['formUrl'];
        }

        return $result;
    }

    /**
     * Вызывает все нужные методы для работы со статусом оплаты
     * @return string
     */
    public function statusAction()
    {
        $message = '';

        $status = $this->setStatusPayment($_GET['orderId']);

        if ($status === 'Оплачен') {
            $message = 'Ваш оплата принята!';
        } else {
            $message = 'Ошибка оплаты заказа';
        }

        return $message;
    }

    /**
     * В зависимости от условий вызывает метод на создание или метод на изменения статуса
     */
    public function finalAction()
    {
        if (!empty($_POST)) {
            $href = $this->createAction();
            if ($href) {
                LocalRedirect($href);
            }
        } elseif (isset($_GET['orderId'])) {
            $result = $this->statusAction();
            $this->arResult['STATUS_PAY_TEXT'] = $result;
        }
    }


    public function executeComponent()
    {
        $this->finalAction();

        $this->includeComponentTemplate();
    }
}