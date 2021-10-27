<?php namespace Bitrix\ModuleORM;

use Bitrix\Main\Entity;

/**
 * Class DataTable
 *
 * Fields:
 * <ul>
 * <li> ID int mandatory
 * <li> COUPON_NAME string mandatory
 * <li> GROUP_ID int mandatory
 * </ul>
 *
 **/

class DataTable extends Entity\DataManager
{
    /**
     * Returns DB table name for entity.
     *
     * @return string
     */
    public static function getTableName() : string
    {
        return 'table_name';
    }

    /**
     * Returns entity map definition.
     *
     * @return array
     */
    public static function getMap() : array
    {
        return array(
            'ID' => array(
                'data_type' => 'integer',
                'primary' => true,
                'autocomplete' => true,
                'title' => 'ID',
            ),
            'NAME' => array(
                'data_type' => 'text',
                'required' => true,
                'title' => 'Название',
            ),
        );
    }
}
