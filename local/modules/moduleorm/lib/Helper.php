<?php

namespace Bitrix\ModuleORM;

use Bitrix\Main\Config\Option;


class Helper
{
    /**
     * Получение всех записей из таблицы
     * @return array
     */
    public function getList():array
    {
        $elements = [];
        $result = DataTable::getList(
            [
                'select' => array('*')
            ]
        );

        while ($element = $result->fetch()) {
            $elements[$element['ID']] = $element;
        }

        return $elements;
    }

    /**
     * Удаление записи из таблицы по ID
     * @param $ID
     * @return string[]
     */
    public function delete($ID): array
   {
       $result = ['status' => 'error', 'errors' => ''];
       $deletionTableElement = DataTable::delete($ID);

       if (!$deletionTableElement->isSuccess())
       {
           $result['errors'] = $deletionTableElement->getErrorMessages();
       } else {
           $result['status'] = 'success';
       }
       return $result;
   }


    /**
     * Добавление новой записи в таблицу
     * @param $arrFields
     * @return string[]
     */
    public function add($arrFields): array
   {
       $result = ['status' => 'error', 'errors' => ''];
       $addTableElement = DataTable::add($arrFields);

       if (!$addTableElement->isSuccess())
       {
           $result['errors'] = $addTableElement->getErrorMessages();
       } else {
           $result['status'] = 'success';
       }

       return $result;
   }

    /**
     * Запись в таблицу при отравке POST запроса
     */
   public function action() {
        if (isset($_POST['ADD']) && $_POST['ADD'] !== '') {
            $arrFields['NAME'] = $_POST['ADD'];
            $result = $this->add($arrFields);
            if ($result['status'] === 'success') {
                //Действие при успешной записи
            } else {
                //Обработка ошибок
            }
        }
   }

}