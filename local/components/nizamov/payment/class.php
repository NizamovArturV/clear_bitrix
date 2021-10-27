<?php

if (!defined("B_PROLOG_INCLUDED") || B_PROLOG_INCLUDED !== true) {
    die();
}

use Bitrix\Main\Loader;
use Bitrix\Main\LoaderException;
use Bitrix\Main\Entity;

class Payment extends CBitrixComponent
{

    public $user;
    public \Nizamov\Main $mainClassObject;
    public \Bitrix\SberBankStart\Payment $sberClassObject;
    public $iblockID;

    public function __construct($component = null)
    {
        parent::__construct($component);
        CModule::IncludeModule('iblock');
        CModule::IncludeModule('highloadblock');
        CModule::IncludeModule('sberbankstart');
        global $USER;
        $this->user = $USER;
        $this->sberClassObject = new Bitrix\SberBankStart\Payment();
        $this->mainClassObject = new Nizamov\Main();

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
        $arFields = [
            "ACTIVE" => "Y",
            "IBLOCK_ID" => $this->iblockID,
            "NAME" => "Заявка " . $propertyValues[$this->arParams['ORDER_ID_PROPERTY_CODE']],
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

        $elementID = $this->getElementIDBySberId($this->iblockID, $idSberPayment);

        $statusState = $this->sberClassObject->getStatusSberbank($idSberPayment);

        if ($statusState) {
            $status = $this->arParams['STATUS_PAY_FAIL'];
        } else {
            $status = $this->arParams['STATUS_PAY_SUCCESS'];
        }

        CIBlockElement::SetPropertyValuesEx($elementID, $this->iblockID, array($this->arParams['STATUS_PROPERTY_CODE'] => $status));

        return $statusState;
    }

    /**
     * Получает ID элемента по номеру зазака в Сбербанке
     *
     * @param $iblockId
     * @param $idSberPayment
     *
     * @return false|mixed
     */
    public function getElementIDBySberId($iblockId, $idSberPayment): bool
    {
        $result = false;
        $arSelect = ["ID", "NAME", 'IBLOCK_ID', 'PROPERTIES_*'];
        $arFilter = [
            "IBLOCK_ID" => $iblockId,
            "ACTIVE_DATE" => "Y",
            "ACTIVE" => "Y",
            '=PROPERTY_' . $this->arParams['ORDER_ID_PROPERTY_CODE'] => $idSberPayment
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
        $result = '';
        $arParameters = $_POST['PROPERTY'];
        $arParameters[$this->arParams['STATUS_PROPERTY_CODE']] = $this->arParams['STATUS_PAY_FAIL'];

        $amount = $this->checkCalculateAmount();

        $amount = str_replace('.', '', $amount);

        $arrSber = $this->sberClassObject->registerSberbank($amount);
        if ($arrSber['status'] === 'success') {
            $arParameters[$this->arParams['ORDER_ID_PROPERTY_CODE']] = $arrSber['orderId'];
            $newElement = $this->createNewPayment($arParameters);
            $result = $arrSber['url'];
        }

        return $result;
    }

    /**
     * Вызывает все нужные методы для работы со статусом оплаты
     * @return string
     */
    public function statusAction(): string
    {
        $message = '';

        $status = $this->setStatusPayment($_GET['orderId']);

        if ($status) {
            $message = $this->arParams['MESSAGE_SUCCESS'];
        } else {
            $message = $this->arParams['MESSAGE_FAIL'];
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
            var_dump($href);
            if ($href) {
                LocalRedirect($href);
            }
        } elseif (isset($_GET['orderId'])) {
            $result = $this->statusAction();
            $this->arResult['STATUS_PAY_TEXT'] = $result;
        }
    }

    private function checkExist(): bool
    {
        if ($this->mainClassObject->getIblockID($this->arParams['IBLOCK_TYPE'], $this->arParams['IBLOCK_CODE']) === 0) {
            $this->arResult['ERRORS'][] = 'Создайте указанный в параметрах инфоблок';
        } else {
            $this->iblockID = $this->mainClassObject->getIblockID($this->arParams['IBLOCK_TYPE'], $this->arParams['IBLOCK_CODE']);
            $propertyOrderID = $this->checkProperty($this->arParams['ORDER_ID_PROPERTY_CODE'], $iblockID);
            if ($propertyOrderID === 0) {
                $this->arResult['ERRORS'][] = 'Создайте указанное в параметре ORDER_ID_PROPERTY_CODE свойство';

            }
            $propertyStatusID = $this->checkProperty($this->arParams['STATUS_PROPERTY_CODE'], $iblockID);
            if ($propertyStatusID === 0) {
                $this->arResult['ERRORS'][] = 'Создайте указанное в параметре STATUS_PROPERTY_CODE свойство';

            }
            $propertyAmountID = $this->checkProperty($this->arParams['AMOUNT_PROPERTY_CODE'], $iblockID);
            if ($propertyAmountID === 0) {
                $this->arResult['ERRORS'][] = 'Создайте указанное в параметре AMOUNT_PROPERTY_CODE свойство';

            }
        }
        return empty($this->arResult['ERRORS']);
    }

    private function checkCalculateAmount() {
        $amount = $_POST['PROPERTY']['AMOUNT'];
        if ($this->arParams['CALCULATE_YOURSELF'] === 'Y') {
            $amount = $this->calculate();
        }
        return $amount;
    }

    private function calculate(): float
    {
        // .. Опишите свою функцию расчета цены
        $amount = 0.00;
        return $amount;
    }

    private function checkProperty($propertyCode, $iblockID): int
    {
        $propertyID = 0;
        $res = CIBlockProperty::GetByID($propertyCode, $iblockID);
        if($ar_res = $res->GetNext()) {
            $propertyID = $ar_res['ID'];
        }
        return $propertyID;
    }

    public function executeComponent()
    {
        if ($this->checkExist()) {
            $this->finalAction();
        }

        $this->includeComponentTemplate();
    }
}