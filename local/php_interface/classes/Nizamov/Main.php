<?php

namespace Nizamov;

use Bitrix\Main\Loader;

class Main
{

    public function __construct()
    {
        $this->includeModules(['iblock', 'highloadblock']);
    }

    /**
     * Подключает нужные модули
     * @param array $moduleNames
     */
    public function includeModules(array $moduleNames){
        foreach ($moduleNames as $moduleName) {
            Loader::includeModule($moduleName);
        }
    }

    /**
     * Получает ID инфоблока по типу и коду
     * @param string $type
     * @param string $code
     *
     * @return int|mixed
     */
    public function getIblockID(string $type, string $code): int
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
            $result = (int)$ar_res['ID'];
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
    public function getElements($idBlock, $filter, $select, $countElement = false, $sort = array()): array
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
     * Получает ID свойства инфоблока по его символьному коду
     * @param string $propertyCode
     * @param int $iblockID
     * @return int
     */
    public function getPropertyIDbyCode(string $propertyCode, int $iblockID): int
    {
        $propertyID = 0;
        $res = \CIBlockProperty::GetByID($propertyCode, $iblockID);
        if($ar_res = $res->GetNext()) {
            $propertyID = $ar_res['ID'];
        }
        return $propertyID;
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
     * @param array $data
     * @param false $die
     */
    public function debug(array $data, $die = false) {
        echo '<pre>';
        var_dump($data);
        echo '</pre>';

        if($die) {
            die();
        }
    }

    /**
     * Возвращает различные вариации слов в зависимости от числа (массив вида [новость, новости, новостей])
     * @param int $n
     * @param array $words
     * @return mixed
     */
    public function num2word(int $n, array $words)
    {
        return ($words[($n = ($n = $n % 100) > 19 ? ($n % 10) : $n) == 1 ? 0 : (($n > 1 && $n <= 4) ? 1 : 2)]);
    }

    /**
     * Получает список свойств инфоблока
     * @param int $iblockID
     * @param array|string[] $arrSort
     * @param array $arrFilter
     * @return array
     */
    public function getListProperties(int $iblockID, array $arrSort = ["sort"=>"asc", "name"=>"asc"], array $arrFilter = []): array
    {
        $arProps = [];
        if (empty($arrFilter)) {
            $arrFilter = ["ACTIVE"=>"Y", "IBLOCK_ID"=>$iblockID];
        }

        $properties = \CIBlockProperty::GetList($arrSort, $arrFilter);
        while ($prop_fields = $properties->GetNext())
        {
            $arProps[] = $prop_fields;
        }
        return $arProps;
    }

    /**
     * Возвращает все значения типа список у свойства по коду
     * @param int $iblockID
     * @param string $code
     * @return array
     */
    public function getListValuesOfPropertyListByCode(int $iblockID, string $code): array
    {
        $values = [];
        $propertyEnums = \CIBlockPropertyEnum::GetList(["DEF"=>"DESC", "SORT"=>"ASC"], ["IBLOCK_ID"=>$iblockID, "CODE"=>$code]);
        while($enumFields = $propertyEnums->GetNext())
        {
            $values[$enumFields['ID']] = $enumFields['VALUE'];
        }
        return $values;
    }

}