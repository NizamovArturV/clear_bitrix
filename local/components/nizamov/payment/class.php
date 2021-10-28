<?php

if (!defined("B_PROLOG_INCLUDED") || B_PROLOG_INCLUDED !== true) {
    die();
}

use Bitrix\Main\Application;
use Bitrix\Main\Loader;
use Bitrix\Main\LoaderException;
use Bitrix\Main\Entity;
use Nizamov\Main;

class Payment extends CBitrixComponent
{

    public $user;
    public Main $mainClassObject;
    public \Bitrix\SberBankStart\Payment $sberClassObject;
    private int $iblockID;
    public $request;

    public function __construct($component = null)
    {
        parent::__construct($component);
        global $USER;
        $this->user = $USER;
        $this->mainClassObject = new Nizamov\Main();
        $this->mainClassObject->includeModules(['iblock', 'highloadblock', 'sberbankstart']);
        $this->sberClassObject = new \Bitrix\SberBankStart\Payment();
        $this->request = Application::getInstance()->getContext()->getRequest();
    }

    /**
     * Создает новую заявку на оплату, возвращает id нового элемента
     * @param array $propertyValues
     * @return array
     */
    private function createNewPayment(array $propertyValues): array
    {
        $result = ['ID' => 0, 'error' => ''];
        $arFields = [
            "ACTIVE" => "Y",
            "IBLOCK_ID" => $this->iblockID,
            "NAME" => "Заявка " . $propertyValues[$this->arParams['ORDER_ID_PROPERTY_CODE']],
            "PROPERTY_VALUES" => $propertyValues
        ];

        $oElement = new CIBlockElement();

        if($newElementID = $oElement->Add($arFields, false, false, true)) {
            $result['ID'] = (int)$newElementID;
        } else {
            $result['error'] = $oElement->LAST_ERROR;
        }

        return $result;
    }

    /**
     * Получает сообщение об успешности оплаты заказа
     * @param string $idSberPayment
     * @return string
     */
    private function getMessageStatus(string $idSberPayment) :string
    {
        $success = false;
        $elementID = $this->getElementIDBySberId($this->iblockID, $idSberPayment);

        if ($elementID > 0) {
            $statusState = $this->sberClassObject->isOrderPaid($idSberPayment);

            if ($statusState) {
                $status = $this->arParams['STATUS_PAY_SUCCESS'];
                $success = true;
                CIBlockElement::SetPropertyValuesEx($elementID, $this->iblockID, array($this->arParams['STATUS_PROPERTY_CODE'] => $status));
            }
        }

        return $success ? $this->arParams['MESSAGE_SUCCESS'] : $this->arParams['MESSAGE_FAIL'];
    }



    /**
     * Получает ID элемента по номеру зазака в Сбербанке
     * @param int $iblockId
     * @param string $idSberPayment
     * @return int
     */
    private function getElementIDBySberId(int $iblockId, string $idSberPayment): int
    {
        $result = 0;
        $arSelect = ["ID", "NAME", 'IBLOCK_ID', 'PROPERTIES_*'];
        $arFilter = [
            "IBLOCK_ID" => $iblockId,
            "ACTIVE_DATE" => "Y",
            "ACTIVE" => "Y",
            '=PROPERTY_' . $this->arParams['ORDER_ID_PROPERTY_CODE'] => $idSberPayment
        ];

        $arrElements = $this->mainClassObject->getElements($iblockId, $arFilter, $arSelect, ["nPageSize" => 1]);
        foreach ($arrElements as $arrElement) {
            if ($arrElement['PROPERTIES'][$this->arParams['ORDER_ID_PROPERTY_CODE']]['VALUE'] === $idSberPayment) {
                $result = (int)$arrElement['ID'];
            }
        }

        return $result;
    }


    /**
     * Вызывает все нужные методы для создания новой оплаты, возвращает массив с url редиректа и ошибкой
     * @return string[]
     */
    private function createAction(): array
    {
        $result = ['url' => '', 'error' => ''];
        $arParameters = $this->request->getPost('PROPERTY');

        $arParameters[$this->arParams['STATUS_PROPERTY_CODE']] = $this->arParams['STATUS_PAY_FAIL'];

        $amount = $this->checkCalculateAmount($this->request->getPost('PROPERTY')['AMOUNT']);

        $amount = str_replace('.', '', $amount);

        if ($amount === '') {
            $result['error'] = 'Заполните обязательно поле - цена';
        } else {
            $arrSber = $this->sberClassObject->registerSberbank($amount);
            if ($arrSber['status'] === 'success') {
                $arParameters[$this->arParams['ORDER_ID_PROPERTY_CODE']] = $arrSber['orderId'];
                $newElement = $this->createNewPayment($arParameters);
                if ($newElement['ID'] === 0) {
                    $result['error'] = $newElement['error'];
                } else {
                    $result['url'] = $arrSber['url'];
                }
            } else {
                $result['error'] = $arrSber['errorMessage'];
            }
        }


        return $result;
    }


    /**
     * В зависимости от условий вызывает метод на создание или метод на изменения статуса
     */
    private function finalAction()
    {
        if (!empty($this->request->getPostList()->toArray())) {
            $createResult = $this->createAction();
            if ($createResult['url']) {
                LocalRedirect($createResult['url']);
            } else {
                $this->arResult['ERRORS'][] = $createResult['error'];
            }
        } else {
            $orderID = (string)$this->request->getQuery('orderId');
            if ($orderID !== '') {
                $this->arResult['STATUS_PAY_TEXT'] = $this->getMessageStatus((string)$orderID);
            }
        }
    }

    /**
     * Проверяет, создан ли инфоблок и свойства для работы компонента
     * @return bool
     */
    private function isParamsBlockAndPropertyExist(): bool
    {
        $this->iblockID = $this->mainClassObject->getIblockID($this->arParams['IBLOCK_TYPE'], $this->arParams['IBLOCK_CODE']);
        if ($this->iblockID === 0) {
            $this->arResult['ERRORS'][] = 'Создайте указанный в параметрах инфоблок';
        } else {

            $propertyCodesParamsArray = ['ORDER_ID_PROPERTY_CODE', 'STATUS_PROPERTY_CODE', 'AMOUNT_PROPERTY_CODE'];

            foreach ($propertyCodesParamsArray as $propertyCodeParam) {
                $propertyID = $this->mainClassObject->getPropertyIDbyCode((string)$this->arParams[$propertyCodeParam], $this->iblockID);
                if ($propertyID === 0) {
                    $this->arResult['ERRORS'][] = 'Создайте указанное в параметре ' . $propertyCodeParam . ' свойство';
                }
            }
        }
        return empty($this->arResult['ERRORS']);
    }

    /**
     * Если установлен параметр собственного расчета, возвращает рассчитанную цену
     * @param string $amount
     * @return string
     */
    private function checkCalculateAmount(string $amount): string
    {
        if ($this->arParams['CALCULATE_YOURSELF'] === 'Y') {
            $amount = $this->calculate();
        }
        return (string)$amount;
    }

    /**
     * Функция для собственного расчета цены
     * @return float
     */
    private function calculate(): float
    {
        // .. Опишите свою функцию расчета цены
        $amount = 0.00;
        return $amount;
    }

    
    public function executeComponent()
    {
        if ($this->isParamsBlockAndPropertyExist()) {
            $this->finalAction();
        }

        $this->includeComponentTemplate();
    }
}