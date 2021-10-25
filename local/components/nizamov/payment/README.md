Компонент Оплаты для сбербанка 
Принимает только цену, можно расширить функционал, комментарий в нужном месте оставил 
Вызов компонента 
<? $APPLICATION->IncludeComponent(
    "nizamov:payment",
    ".default",
    Array(
        'IBLOCK_CODE' => 'payment',
        'IBLOCK_TYPE' => 'services',
        'TEST' => 'Y'
    ),
    false
);?>
