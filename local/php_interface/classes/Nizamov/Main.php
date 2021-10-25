<?php

namespace Nizamov;

class Main
{

    public function __construct()
    {
        \CModule::IncludeModule('iblock');
        \CModule::IncludeModule('highloadblock');
    }

    /**
     * Получает ID инфоблока по типу и коду
     * @param $type
     * @param $code
     *
     * @return int|mixed
     */
    public function getIblockID($type, $code)
    {
        $result = 0;

        $res = \CIBlock::GetList(
            array(),
            array(
                'TYPE' => $type,
                'SITE_ID' => SITE_ID,
                'ACTIVE' => 'Y',
                "CNT_ACTIVE" => "Y",
                "CODE" => $code
            ), true
        );
        while ($ar_res = $res->Fetch()) {
            $result = $ar_res['ID'];
        }

        return $result;
    }

    /**
     * Получить список элементов
     * @param $idBlock
     * @param $filter
     * @param $select
     * @param false $countElement
     * @param array $sort
     * @return array
     */
    public function getElements($idBlock, $filter, $select, $countElement = false, $sort = array())
    {
        $result = [];
        if ($idBlock) {
            $res = \CIBlockElement::GetList($sort, $filter, false, $countElement, $select);
            while ($ob = $res->GetNextElement()) {
                $arFields = $ob->GetFields();
                $arProps = $ob->GetProperties();
                $result[$arFields['ID']] = $arFields;
                $result[$arFields['ID']]['PROPERTIES'] = $arProps;
            }
        }

        return $result;
    }

    /**
     * Генерация рандомной строки
     * @param int $length
     * @param bool $chars
     * @return string
     */
    public function generateRandomCode($length = 6, $chars = true) {
        $characters = '023456789';

        if($chars)
        {
            $characters .= 'abcdefghijkmnopqrstuvwxyz';
        }

        $charactersLength = strlen($characters);
        $randomString = '';

        for ($i = 0; $i < $length; $i++)
        {
            $randomString .= $characters[rand(0, $charactersLength - 1)];
        }

        return $randomString;
    }

    /**
     * Дебаг массивов
     * @param $data
     * @param false $die
     */
    public function debug($data, $die = false) {
        echo '<pre>';
        print_r($data);
        echo '</pre>';

        if($die) {
            die();
        }
    }

    /**
     * Возвращает различные вариации слов в зависимости от числа (массив вида [новость, новости, новостей])
     * @param $n
     * @param $words
     * @return mixed
     */
    public function num2word($n, $words)
    {
        return ($words[($n = ($n = $n % 100) > 19 ? ($n % 10) : $n) == 1 ? 0 : (($n > 1 && $n <= 4) ? 1 : 2)]);
    }

}