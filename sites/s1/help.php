<?
require($_SERVER['DOCUMENT_ROOT'].'/bitrix/header.php');
?>
<h1>Демонстрация шаблона</h1>
    <h2>Получение настроек обычного модуля</h2>
    <p>
        <?php
        Bitrix\Main\Loader::includeModule('modulefirst');
        $moduleObject = new Bitrix\ModuleFirst\Helper;
        var_dump($moduleObject->getOption('property1'));
        ?>
    </p>
    <h2>Работа с модулем с ORM </h2>
    <p>
        <?php
        Bitrix\Main\Loader::includeModule('moduleorm');
        $moduleObjectOrm = new Bitrix\ModuleORM\Helper;
        var_dump($listItems = $moduleObjectOrm->getList());
        ?>
    </p>
    <h2>Использование главных классов</h2>
        <?php $mainClassObject = new Nizamov\Main();?>
        <h3>Окончание слова в зависимости от числа</h3>
            <p>
                4 <?=$mainClassObject->num2word(4, ['новость', 'новости', 'новостей'])?>
            </p>
        <h3>Генерация рандомной строки</h3>
            <p>Только числа - <?=$mainClassObject->generateRandomCode(5, false)?> </p>
            <p>С буквами - <?=$mainClassObject->generateRandomCode(5)?> </p>
        <h3>Дебаг массивов</h3>
            <p>
                <?$mainClassObject->debug($listItems)?>
            </p>
    <h2>Оплата сбербанк (редирект на форму оплаты)</h2>
        <? $APPLICATION->IncludeComponent(
            "nizamov:payment",
            ".default",
            Array(
                'IBLOCK_CODE' => 'payment', //Код ифоблока с заявками на оплату
                'IBLOCK_TYPE' => 'services', //Код типа инфоблока с заявками
                'ORDER_ID_PROPERTY_CODE' => 'ORDER_ID', //Код свойства для записи номера заказа в сбербанке
                'STATUS_PROPERTY_CODE' => 'STATUS_PAY', //Код свойства для записи статуса заказа
                'AMOUNT_PROPERTY_CODE' => 'AMOUNT', //Код свойства для записи цены заказа
                'CALCULATE_YOURSELF' => 'N', //Компонент сам будет считать стоимость, а не принимать значение из формы
                'STATUS_PAY_SUCCESS' => 'Оплачен', //Что устанавливать в свойство при успешной оплате
                'STATUS_PAY_FAIL' => 'Не оплачен', //Что устанавливать в свойство при не успешной оплате
                'MESSAGE_SUCCESS' => 'Ваша заявка оплачена', //Текст, который нужно выводить пользователю при успешной оплате
                'MESSAGE_FAIL' => 'Ваша заявка не оплачена', //Текст, который нужно выводить пользователю при не успешной оплате
            ),
            false
        );?>

<?
require($_SERVER['DOCUMENT_ROOT'].'/bitrix/footer.php');
?>