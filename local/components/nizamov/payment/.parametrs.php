<?php
if (!defined("B_PROLOG_INCLUDED") || B_PROLOG_INCLUDED !== true) {
    die();
}

$arComponentParameters = [
    'GROUPS' => [],
    'PARAMETERS' => [
        'IBLOCK_CODE' => [
            'PARENT' => 'BASE',
            'NAME' => 'Символьный код инфоблока с заявками',
            'TYPE' => 'STRING',
            'MULTIPLE' => 'N',
            'DEFAULT' => '',
        ],
        'IBLOCK_TYPE' => [
            'PARENT' => 'BASE',
            'NAME' => 'Символьный код типа инфоблока с заявками',
            'TYPE' => 'STRING',
            'MULTIPLE' => 'N',
            'DEFAULT' => '',
        ],
        'ORDER_ID_PROPERTY_CODE' => [
            'PARENT' => 'BASE',
            'NAME' => 'Код свойства для записи номера заказа в сбербанке',
            'TYPE' => 'STRING',
            'MULTIPLE' => 'N',
            'DEFAULT' => '',
        ],
        'STATUS_PROPERTY_CODE' => [
            'PARENT' => 'BASE',
            'NAME' => 'Код свойства для записи статуса заказа',
            'TYPE' => 'STRING',
            'MULTIPLE' => 'N',
            'DEFAULT' => '',
        ],
        'AMOUNT_PROPERTY_CODE' => [
            'PARENT' => 'BASE',
            'NAME' => 'Код свойства для записи цены заказа',
            'TYPE' => 'STRING',
            'MULTIPLE' => 'N',
            'DEFAULT' => '',
        ],
        'CALCULATE_YOURSELF' => [
            'PARENT' => 'BASE',
            'NAME' => 'Компонент сам будет считать стоимость, а не принимать значение из формы',
            'TYPE' => 'STRING',
            'MULTIPLE' => 'N',
            'DEFAULT' => '',
        ],
        'STATUS_PAY_SUCCESS' => [
            'PARENT' => 'BASE',
            'NAME' => 'Что устанавливать в свойство при успешной оплате',
            'TYPE' => 'STRING',
            'MULTIPLE' => 'N',
            'DEFAULT' => '',
        ],
        'STATUS_PAY_FAIL' => [
            'PARENT' => 'BASE',
            'NAME' => 'Что устанавливать в свойство при не успешной оплате',
            'TYPE' => 'STRING',
            'MULTIPLE' => 'N',
            'DEFAULT' => '',
        ],
        'MESSAGE_SUCCESS' => [
            'PARENT' => 'BASE',
            'NAME' => 'Текст, который нужно выводить пользователю при успешной оплате',
            'TYPE' => 'STRING',
            'MULTIPLE' => 'N',
            'DEFAULT' => '',
        ],
        'MESSAGE_FAIL' => [
            'PARENT' => 'BASE',
            'NAME' => 'Текст, который нужно выводить пользователю при не успешной оплате',
            'TYPE' => 'STRING',
            'MULTIPLE' => 'N',
            'DEFAULT' => '',
        ],

    ]
];